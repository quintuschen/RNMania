//
//  ContentView.swift
//  RNMania
//
//  Created by Guo Chen on 07/06/2026.
//

import SwiftUI

struct ContentView: View {
    var body: some View {
        TabView {
            HomeView()
                .tabItem { Label("Home", systemImage: "house.fill") }

            rnModuleTab
                .tabItem { Label("Web Module", systemImage: "globe") }
        }
    }

    /// Renders the real ReactNativeView when RN is linked; falls back to
    /// RNPlaceholderView (architecture diagram) in the SPM-only build.
    @ViewBuilder
    private var rnModuleTab: some View {
        #if canImport(React)
        ReactNativeView(moduleName: "NovaPay", initialProps: [:])
            .ignoresSafeArea()
        #else
        RNPlaceholderView()
        #endif
    }
}

#Preview {
    ContentView()
}
