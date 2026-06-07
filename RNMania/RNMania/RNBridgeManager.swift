import Foundation

// ──────────────────────────────────────────────────────────────────────────────
// Production bridge manager — requires React Native to be linked via CocoaPods.
// In the current POC setup (SPM-only), this code is excluded at compile time.
// To activate: add React Native via CocoaPods and remove the #if guard.
// ──────────────────────────────────────────────────────────────────────────────

#if canImport(React)
import React

/// Manages a single RCTBridge instance for the whole app.
/// RCTBridge is expensive to create — one per process, shared everywhere.
final class RNBridgeManager: NSObject {
    static let shared = RNBridgeManager()

    private var bridge: RCTBridge?

    private override init() {
        super.init()
        bridge = RCTBridge(delegate: self, launchOptions: nil)
    }

    func makeRootView(moduleName: String, initialProps: [String: Any] = [:]) -> UIView {
        guard let bridge else { preconditionFailure("RCTBridge not initialised") }
        return RCTRootView(
            bridge: bridge,
            moduleName: moduleName,
            initialProperties: initialProps
        )
    }
}

extension RNBridgeManager: RCTBridgeDelegate {
    func sourceURL(for bridge: RCTBridge!) -> URL! {
        #if DEBUG
        // Point to Metro dev server while developing
        RCTBundleURLProvider.sharedSettings().jsBundleURL(forBundleRoot: "index")
        #else
        // Bundled JS packed into the release .ipa
        Bundle.main.url(forResource: "main", withExtension: "jsbundle")
        #endif
    }
}
#endif
