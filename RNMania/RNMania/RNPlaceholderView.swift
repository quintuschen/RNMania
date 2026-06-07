import SwiftUI

// Step 4 时用真正的 RCTRootView 替换此占位视图
struct RNPlaceholderView: View {
    var body: some View {
        VStack(spacing: 20) {
            Image(systemName: "cube.box.fill")
                .font(.system(size: 56))
                .foregroundStyle(.blue)

            Text("React Native Module")
                .font(.title2.bold())

            Text("React Native 模块将在 Step 4 嵌入到这里")
                .font(.body)
                .foregroundStyle(.secondary)
                .multilineTextAlignment(.center)
                .padding(.horizontal)

            RoundedRectangle(cornerRadius: 8)
                .stroke(style: StrokeStyle(lineWidth: 2, dash: [8]))
                .foregroundStyle(.blue.opacity(0.4))
                .frame(height: 200)
                .overlay {
                    Text("RCTRootView placeholder")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding()
        }
        .padding()
    }
}

#Preview {
    RNPlaceholderView()
}
