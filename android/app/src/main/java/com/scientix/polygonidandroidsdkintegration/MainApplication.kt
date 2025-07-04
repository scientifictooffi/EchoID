package com.scientix.polygonidandroidsdkintegration

import android.app.Application
import android.content.res.Configuration
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultReactNativeHost
import com.polygonid.sdk.PolygonidNativePackage   
import com.facebook.soloader.SoLoader
import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost = ReactNativeHostWrapper(
    this,
    object : DefaultReactNativeHost(this){
      override fun getPackages(): List<ReactPackage> {
        
        val packages = PackageList(this).packages.toMutableList()
        
        packages.add(PolygonidNativePackage())
        
        return packages
      }

      override fun getJSMainModuleName() = ".expo/.virtual-metro-entry"
      override fun getUseDeveloperSupport() = BuildConfig.DEBUG
      override val isNewArchEnabled   = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
      override val isHermesEnabled    = BuildConfig.IS_HERMES_ENABLED
    }
  )

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, /* native exopackage */ false)
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
