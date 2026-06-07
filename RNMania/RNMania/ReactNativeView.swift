import SwiftUI

// ──────────────────────────────────────────────────────────────────────────────
// Production SwiftUI ↔ React Native bridge.
// Requires React Native linked via CocoaPods; excluded from compilation otherwise.
//
// Usage (in ContentView or any SwiftUI view):
//   ReactNativeView(moduleName: "NovaPay", initialProps: [:])
//       .ignoresSafeArea()
//
// The moduleName must match what's registered in index.js:
//   AppRegistry.registerComponent('NovaPay', () => App)
// ──────────────────────────────────────────────────────────────────────────────

#if canImport(React)
import UIKit
import React

struct ReactNativeView: UIViewControllerRepresentable {
    /// Must match AppRegistry.registerComponent('moduleName', ...) in index.js
    let moduleName: String
    var initialProps: [String: Any] = [:]

    func makeUIViewController(context: Context) -> UIViewController {
        let vc = UIViewController()
        vc.view = RNBridgeManager.shared.makeRootView(
            moduleName: moduleName,
            initialProps: initialProps
        )
        return vc
    }

    func updateUIViewController(_ uiViewController: UIViewController, context: Context) {
        // RCTRootView does not support live prop updates.
        // For dynamic data, use a Native Module to post events to the JS side.
    }
}
#endif
