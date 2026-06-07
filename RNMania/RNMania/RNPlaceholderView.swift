import SwiftUI

/// Shown when React Native is not linked (SPM-only build).
/// When RN is linked via CocoaPods, ContentView substitutes ReactNativeView instead.
struct RNPlaceholderView: View {
    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(alignment: .leading, spacing: 20) {
                    statusBanner
                    architectureDiagram
                    bridgeFilesSection
                    spmConstraintNote
                    integrationSteps
                }
                .padding()
            }
            .navigationTitle("RN Bridge")
        }
    }

    // MARK: – Status banner

    private var statusBanner: some View {
        HStack(spacing: 12) {
            Image(systemName: "wrench.and.screwdriver.fill")
                .font(.title2)
                .foregroundStyle(.orange)
            VStack(alignment: .leading, spacing: 3) {
                Text("Bridge code written — not linked")
                    .font(.headline)
                Text("CocoaPods required to activate ReactNativeView")
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
        .padding()
        .frame(maxWidth: .infinity, alignment: .leading)
        .background(.orange.opacity(0.12), in: RoundedRectangle(cornerRadius: 10))
    }

    // MARK: – Architecture diagram

    private var architectureDiagram: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Call Stack", systemImage: "square.stack.3d.up.fill")
                .font(.headline)

            VStack(spacing: 0) {
                archBox("SwiftUI ContentView",
                        subtitle: "TabView — native entry point",
                        color: .orange, icon: "swift")
                downArrow
                archBox("ReactNativeView",
                        subtitle: "UIViewControllerRepresentable",
                        color: .blue, icon: "arrow.left.arrow.right")
                downArrow
                archBox("RNBridgeManager.shared",
                        subtitle: "RCTBridge — one per process",
                        color: .purple, icon: "link.circle.fill")
                downArrow
                archBox("RCTRootView",
                        subtitle: "UIView that runs the JS bundle",
                        color: .green, icon: "cube.fill")
                downArrow
                HStack(spacing: 8) {
                    archBox("Metro :8081",
                            subtitle: "DEBUG",
                            color: .yellow, icon: "server.rack")
                    archBox("main.jsbundle",
                            subtitle: "RELEASE",
                            color: Color(.systemGray), icon: "archivebox.fill")
                }
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func archBox(_ title: String, subtitle: String, color: Color, icon: String) -> some View {
        HStack(spacing: 10) {
            Image(systemName: icon)
                .foregroundStyle(color)
                .frame(width: 22)
            VStack(alignment: .leading, spacing: 2) {
                Text(title)
                    .font(.system(.callout, design: .monospaced))
                    .fontWeight(.semibold)
                Text(subtitle)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
            Spacer()
        }
        .padding(10)
        .background(color.opacity(0.1), in: RoundedRectangle(cornerRadius: 8))
    }

    private var downArrow: some View {
        Image(systemName: "arrow.down")
            .foregroundStyle(.secondary)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 4)
    }

    // MARK: – Bridge files

    private var bridgeFilesSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("Bridge Files", systemImage: "doc.text.fill")
                .font(.headline)

            fileRow(
                name: "ReactNativeView.swift",
                role: "UIViewControllerRepresentable",
                detail: "Wraps RCTRootView in SwiftUI. One line to embed in any view."
            )
            fileRow(
                name: "RNBridgeManager.swift",
                role: "RCTBridge singleton",
                detail: "Creates the bridge once per app lifetime. Manages JS source URL (Metro vs bundle)."
            )

            Text("Both files are guarded by #if canImport(React) — they compile to nothing until RN is linked, keeping the SPM-only build green.")
                .font(.caption)
                .foregroundStyle(.secondary)
                .padding(.top, 4)
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private func fileRow(name: String, role: String, detail: String) -> some View {
        HStack(alignment: .top, spacing: 10) {
            Image(systemName: "doc.badge.gearshape.fill")
                .foregroundStyle(.blue)
                .frame(width: 22)
            VStack(alignment: .leading, spacing: 3) {
                Text(name)
                    .font(.system(.body, design: .monospaced))
                Text(role)
                    .font(.caption)
                    .fontWeight(.medium)
                    .foregroundStyle(.blue)
                Text(detail)
                    .font(.caption)
                    .foregroundStyle(.secondary)
            }
        }
    }

    // MARK: – SPM constraint

    private var spmConstraintNote: some View {
        VStack(alignment: .leading, spacing: 8) {
            Label("Why not linked today", systemImage: "xmark.circle.fill")
                .font(.headline)
                .foregroundStyle(.red)

            Text("React Native 0.85 ships its iOS frameworks via CocoaPods only. A Package.swift exists in the source tree (ReactNativeDependencies/Package.swift) but the required .xcframework binaries are not published to any CDN, making SPM non-functional in practice.")
                .font(.caption)
                .foregroundStyle(.secondary)

            Text("The base SwiftUI app is SPM-only. Introducing CocoaPods would require converting the project to an .xcworkspace and adding a Podfile — a structural change the team wants to avoid.")
                .font(.caption)
                .foregroundStyle(.secondary)
        }
        .padding()
        .background(.red.opacity(0.07), in: RoundedRectangle(cornerRadius: 12))
    }

    // MARK: – Steps to activate

    private var integrationSteps: some View {
        VStack(alignment: .leading, spacing: 12) {
            Label("To activate (if CocoaPods allowed)", systemImage: "list.number")
                .font(.headline)

            ForEach(steps, id: \.0) { step in
                HStack(alignment: .top, spacing: 10) {
                    Text("\(step.0)")
                        .font(.caption.bold())
                        .foregroundStyle(.white)
                        .frame(width: 20, height: 20)
                        .background(.blue, in: Circle())
                    Text(step.1)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
            }
        }
        .padding()
        .background(.regularMaterial, in: RoundedRectangle(cornerRadius: 12))
    }

    private let steps: [(Int, String)] = [
        (1, "Add Podfile to RNMania/ referencing React-Core and its dependencies"),
        (2, "Run `pod install` → Xcode converts to .xcworkspace"),
        (3, "In ContentView.swift, swap `RNPlaceholderView()` for `ReactNativeView(moduleName: \"NovaPay\", initialProps: [:])`"),
        (4, "Start Metro: `npm start` in rn-app/ directory"),
        (5, "Build & run — RCTRootView loads the JS bundle from Metro"),
    ]
}

#Preview {
    RNPlaceholderView()
}
