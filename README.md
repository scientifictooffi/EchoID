# EchoID

EchoID is a comprehensive identity verification solution that leverages blockchain technology for secure and private identity management. This project includes both the core SDK and sample applications demonstrating its implementation.

## 🌟 Features

- Secure identity verification using blockchain technology
- Cross-platform support (Android, iOS)
- Sample verifier application
- Integration with Polygon ID
- Expo-based implementation
- Modern UI/UX design

## 📁 Project Structure

```
EchoID/
├── app/                    # Main application code
├── components/            # Reusable UI components
├── polygonid-android-sdk/ # Core Android SDK implementation
├── EchoID-verifier-sample/# Sample verifier application
├── services/              # Backend services
├── store/                 # State management
├── utils/                 # Utility functions
└── types/                # TypeScript type definitions
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v16 or higher)
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development)
- Git

### Installation

1. Clone the repository:

```bash
git clone https://github.com/scientifictooffi/EchoID.git
cd EchoID
```

2. Install dependencies:

```bash
npm install
# or
bun install
```

3. Set up environment variables:

- Copy `.env.example` to `.env`
- Fill in the required environment variables

### Development

#### Running the App

```bash
# Start the development server
npm start
# or
bun start

# Run on Android
npm run android
# or
bun run android

# Run on iOS
npm run ios
# or
bun run ios
```

#### Building for Production

```bash
# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios
```

## 📱 SDK Integration

The project includes a native Android SDK (`polygonid-android-sdk`) that provides core functionality for identity verification. To integrate the SDK into your own project:

1. Add the GitHub Packages repository to your project's build.gradle:

```gradle
repositories {
    maven {
        url = uri("https://maven.pkg.github.com/0xPolygonID/polygonid-android-sdk")
    }
}
```

2. Add the dependency:

```gradle
implementation 'com.github.0xPolygonID:polygonid-android-sdk:2.0.0'
```

## 🔧 Development Notes

### Expo Go Compatibility

This project uses native modules and custom native code, which means it's not compatible with Expo Go. You'll need to use a development build or standalone app build.

### Development Build

To create a development build:

1. Install EAS CLI:

```bash
npm install -g eas-cli
```

2. Configure your development build:

```bash
eas build:configure
```

3. Create a development build:

```bash
eas build --profile development --platform android
# or
eas build --profile development --platform ios
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Polygon ID](https://polygon.technology/polygon-id/) for the underlying identity technology
- The Expo team for the excellent React Native tooling
- All contributors who have helped shape this project

## 📞 Support

For support and questions, please [open an issue](https://github.com/yourusername/EchoID/issues) on our GitHub repository.
