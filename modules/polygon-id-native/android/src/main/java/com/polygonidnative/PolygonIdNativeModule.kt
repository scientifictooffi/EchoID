package com.polygonidnative

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule
import kotlinx.coroutines.*
import kotlinx.serialization.json.*
import io.iden3.polygonid.android.sdk.*
import io.iden3.polygonid.android.sdk.identity.*
import io.iden3.polygonid.android.sdk.proof.*
import io.iden3.polygonid.android.sdk.credential.*
import io.iden3.polygonid.android.sdk.verification.*
import java.util.*

class PolygonIdNativeModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    
    private val scope = CoroutineScope(Dispatchers.Main + SupervisorJob())
    private lateinit var polygonIdSdk: PolygonIdSdk
    private var currentIdentity: Identity? = null
    
    override fun getName(): String {
        return "PolygonIdNative"
    }
    
    @ReactMethod
    fun initialize(promise: Promise) {
        scope.launch {
            try {
                val config = PolygonIdSdkConfig.Builder()
                    .setNetwork(Network.POLYGON_MUMBAI)
                    .setIpfsNodeUrl("https://ipfs.io")
                    .setRpcUrl("https://polygon-mumbai.g.alchemy.com/v2/your-api-key")
                    .build()
                
                polygonIdSdk = PolygonIdSdk.init(reactApplicationContext, config)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("INIT_ERROR", e.message, e)
            }
        }
    }
    
    @ReactMethod
    fun createIdentity(profileName: String, promise: Promise) {
        scope.launch {
            try {
                val identity = polygonIdSdk.identity.createIdentity()
                currentIdentity = identity
                
                val result = Arguments.createMap().apply {
                    putString("did", identity.did)
                    putString("profileName", profileName)
                    putArray("credentials", Arguments.createArray())
                    putString("createdAt", Date().toString())
                }
                
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("CREATE_IDENTITY_ERROR", e.message, e)
            }
        }
    }
    
    @ReactMethod
    fun importIdentity(seedPhrase: String, promise: Promise) {
        scope.launch {
            try {
                val identity = polygonIdSdk.identity.restoreIdentity(seedPhrase)
                currentIdentity = identity
                
                val result = Arguments.createMap().apply {
                    putString("did", identity.did)
                    putString("profileName", "Imported Identity")
                    putArray("credentials", Arguments.createArray())
                    putString("createdAt", Date().toString())
                }
                
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("IMPORT_IDENTITY_ERROR", e.message, e)
            }
        }
    }
    
    @ReactMethod
    fun addCredential(credentialJson: String, promise: Promise) {
        scope.launch {
            try {
                val identity = currentIdentity ?: throw Exception("No active identity")
                
                val credential = polygonIdSdk.credential.saveCredential(
                    identity = identity,
                    credentialJson = credentialJson
                )
                
                val result = Arguments.createMap().apply {
                    putString("id", credential.id)
                    putArray("type", Arguments.createArray().apply {
                        credential.type.forEach { pushString(it) }
                    })
                    putString("issuer", credential.issuer)
                    putString("issuanceDate", credential.issuanceDate)
                    credential.expirationDate?.let { putString("expirationDate", it) }
                    putMap("credentialSubject", parseCredentialSubject(credential.credentialSubject))
                }
                
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("ADD_CREDENTIAL_ERROR", e.message, e)
            }
        }
    }
    
    @ReactMethod
    fun generateProof(verificationRequestJson: String, promise: Promise) {
        scope.launch {
            try {
                val identity = currentIdentity ?: throw Exception("No active identity")
                
                val verificationRequest = Json.decodeFromString<VerificationRequest>(verificationRequestJson)
                
                // Generate ZK proof
                val proofRequest = ProofRequest(
                    circuitId = verificationRequest.circuitId,
                    query = verificationRequest.query
                )
                
                val proof = polygonIdSdk.proof.generateProof(
                    identity = identity,
                    proofRequest = proofRequest
                )
                
                // Send proof to callback URL if provided
                verificationRequest.callbackUrl?.let { callbackUrl ->
                    sendProofToCallback(callbackUrl, proof, verificationRequest.sessionId)
                }
                
                val result = Arguments.createMap().apply {
                    putString("proof", proof.proofJson)
                    putString("publicSignals", proof.publicSignals.toString())
                    putString("sessionId", verificationRequest.sessionId)
                }
                
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("GENERATE_PROOF_ERROR", e.message, e)
            }
        }
    }
    
    @ReactMethod
    fun processVerificationRequest(qrCodeData: String, promise: Promise) {
        scope.launch {
            try {
                val verificationRequest = parseQRCodeData(qrCodeData)
                
                val result = Arguments.createMap().apply {
                    putString("id", verificationRequest.id)
                    putString("sessionId", verificationRequest.sessionId)
                    putString("callbackUrl", verificationRequest.callbackUrl)
                    putMap("requester", Arguments.createMap().apply {
                        putString("name", verificationRequest.requester.name)
                        putString("did", verificationRequest.requester.did)
                        verificationRequest.requester.logo?.let { putString("logo", it) }
                    })
                    putArray("requestedCredentials", Arguments.createArray().apply {
                        verificationRequest.requestedCredentials.forEach { cred ->
                            pushMap(Arguments.createMap().apply {
                                putString("type", cred.type)
                                putArray("requiredFields", Arguments.createArray().apply {
                                    cred.requiredFields.forEach { pushString(it) }
                                })
                            })
                        }
                    })
                    putString("purpose", verificationRequest.purpose)
                    putString("createdAt", verificationRequest.createdAt)
                    putString("status", "pending")
                }
                
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("PROCESS_QR_ERROR", e.message, e)
            }
        }
    }
    
    @ReactMethod
    fun getCredentials(promise: Promise) {
        scope.launch {
            try {
                val identity = currentIdentity ?: throw Exception("No active identity")
                
                val credentials = polygonIdSdk.credential.getCredentials(identity)
                val result = Arguments.createArray()
                
                credentials.forEach { credential ->
                    result.pushMap(Arguments.createMap().apply {
                        putString("id", credential.id)
                        putArray("type", Arguments.createArray().apply {
                            credential.type.forEach { pushString(it) }
                        })
                        putString("issuer", credential.issuer)
                        putString("issuanceDate", credential.issuanceDate)
                        credential.expirationDate?.let { putString("expirationDate", it) }
                        putMap("credentialSubject", parseCredentialSubject(credential.credentialSubject))
                    })
                }
                
                promise.resolve(result)
            } catch (e: Exception) {
                promise.reject("GET_CREDENTIALS_ERROR", e.message, e)
            }
        }
    }
    
    @ReactMethod
    fun removeCredential(credentialId: String, promise: Promise) {
        scope.launch {
            try {
                val identity = currentIdentity ?: throw Exception("No active identity")
                
                polygonIdSdk.credential.removeCredential(identity, credentialId)
                promise.resolve(true)
            } catch (e: Exception) {
                promise.reject("REMOVE_CREDENTIAL_ERROR", e.message, e)
            }
        }
    }
    
    @ReactMethod
    fun getIdentityBackup(promise: Promise) {
        scope.launch {
            try {
                val identity = currentIdentity ?: throw Exception("No active identity")
                
                val backup = polygonIdSdk.identity.getIdentityBackup(identity)
                promise.resolve(backup)
            } catch (e: Exception) {
                promise.reject("GET_BACKUP_ERROR", e.message, e)
            }
        }
    }
    
    private suspend fun sendProofToCallback(callbackUrl: String, proof: Proof, sessionId: String) {
        try {
            val client = okhttp3.OkHttpClient()
            val json = okhttp3.MediaType.Companion.get("application/json; charset=utf-8")
            
            val requestBody = JsonObject(mapOf(
                "sessionId" to JsonPrimitive(sessionId),
                "proof" to JsonPrimitive(proof.proofJson),
                "publicSignals" to JsonArray(proof.publicSignals.map { JsonPrimitive(it) })
            )).toString()
            
            val request = okhttp3.Request.Builder()
                .url(callbackUrl)
                .post(okhttp3.RequestBody.create(json, requestBody))
                .build()
            
            client.newCall(request).execute()
        } catch (e: Exception) {
            // Log error but don't fail the proof generation
            android.util.Log.e("PolygonIdNative", "Failed to send proof to callback", e)
        }
    }
    
    private fun parseQRCodeData(qrData: String): VerificationRequestData {
        val json = Json.parseToJsonElement(qrData).jsonObject
        
        return VerificationRequestData(
            id = json["id"]?.jsonPrimitive?.content ?: UUID.randomUUID().toString(),
            sessionId = json["sessionId"]?.jsonPrimitive?.content ?: UUID.randomUUID().toString(),
            callbackUrl = json["callbackUrl"]?.jsonPrimitive?.content,
            circuitId = json["circuitId"]?.jsonPrimitive?.content ?: "credentialAtomicQuerySigV2",
            query = json["query"]?.jsonObject ?: JsonObject(emptyMap()),
            requester = RequesterData(
                name = json["requester"]?.jsonObject?.get("name")?.jsonPrimitive?.content ?: "Unknown",
                did = json["requester"]?.jsonObject?.get("did")?.jsonPrimitive?.content ?: "",
                logo = json["requester"]?.jsonObject?.get("logo")?.jsonPrimitive?.content
            ),
            requestedCredentials = json["requestedCredentials"]?.jsonArray?.map { cred ->
                RequestedCredentialData(
                    type = cred.jsonObject["type"]?.jsonPrimitive?.content ?: "",
                    requiredFields = cred.jsonObject["requiredFields"]?.jsonArray?.map { 
                        it.jsonPrimitive.content 
                    } ?: emptyList()
                )
            } ?: emptyList(),
            purpose = json["purpose"]?.jsonPrimitive?.content ?: "Identity verification",
            createdAt = Date().toString()
        )
    }
    
    private fun parseCredentialSubject(credentialSubject: Map<String, Any>): WritableMap {
        val result = Arguments.createMap()
        credentialSubject.forEach { (key, value) ->
            when (value) {
                is String -> result.putString(key, value)
                is Number -> result.putDouble(key, value.toDouble())
                is Boolean -> result.putBoolean(key, value)
                else -> result.putString(key, value.toString())
            }
        }
        return result
    }
    
    private fun sendEvent(eventName: String, params: WritableMap?) {
        reactApplicationContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, params)
    }
}

data class VerificationRequestData(
    val id: String,
    val sessionId: String,
    val callbackUrl: String?,
    val circuitId: String,
    val query: JsonObject,
    val requester: RequesterData,
    val requestedCredentials: List<RequestedCredentialData>,
    val purpose: String,
    val createdAt: String
)

data class RequesterData(
    val name: String,
    val did: String,
    val logo: String?
)

data class RequestedCredentialData(
    val type: String,
    val requiredFields: List<String>
)