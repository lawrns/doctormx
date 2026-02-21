#!/bin/bash
# Security Tools Installation Script
# Installs gitleaks and pre-commit hooks for secret scanning

set -e

echo "================================================"
echo "  Security Tools Installation - Doctormx"
echo "================================================"
echo ""

# Detect OS
OS="$(uname -s)"
ARCH="$(uname -m)"

# Function to install Gitleaks
install_gitleaks() {
    echo "📦 Installing Gitleaks..."
    echo "   OS: $OS, Arch: $ARCH"
    echo ""

    GITLEAKS_VERSION="8.18.2"

    case "$OS" in
        Linux*)
            if [ "$ARCH" = "x86_64" ]; then
                BINARY_NAME="gitleaks_${GITLEAKS_VERSION}_linux_x64.tar.gz"
            elif [ "$ARCH" = "aarch64" ] || [ "$ARCH" = "arm64" ]; then
                BINARY_NAME="gitleaks_${GITLEAKS_VERSION}_linux_arm64.tar.gz"
            else
                echo "❌ Unsupported architecture: $ARCH"
                exit 1
            fi
            ;;
        Darwin*)
            if [ "$ARCH" = "x86_64" ]; then
                BINARY_NAME="gitleaks_${GITLEAKS_VERSION}_darwin_x64.tar.gz"
            elif [ "$ARCH" = "arm64" ]; then
                BINARY_NAME="gitleaks_${GITLEAKS_VERSION}_darwin_arm64.tar.gz"
            else
                echo "❌ Unsupported architecture: $ARCH"
                exit 1
            fi
            ;;
        MINGW*|MSYS*|CYGWIN*)
            if [ "$ARCH" = "x86_64" ]; then
                BINARY_NAME="gitleaks_${GITLEAKS_VERSION}_windows_x64.zip"
            else
                echo "❌ Unsupported architecture: $ARCH"
                exit 1
            fi
            ;;
        *)
            echo "❌ Unsupported OS: $OS"
            exit 1
            ;;
    esac

    DOWNLOAD_URL="https://github.com/gitleaks/gitleaks/releases/latest/download/${BINARY_NAME}"
    TEMP_DIR=$(mktemp -d)
    INSTALL_DIR="$HOME/.local/bin"

    echo "   Downloading from: $DOWNLOAD_URL"

    # Create install directory if it doesn't exist
    mkdir -p "$INSTALL_DIR"

    # Download
    if command -v wget >/dev/null 2>&1; then
        wget -q "$DOWNLOAD_URL" -O "$TEMP_DIR/gitleaks.tar.gz"
    elif command -v curl >/dev/null 2>&1; then
        curl -sL "$DOWNLOAD_URL" -o "$TEMP_DIR/gitleaks.tar.gz"
    else
        echo "❌ Neither wget nor curl is installed"
        exit 1
    fi

    # Extract
    if [[ "$BINARY_NAME" == *.zip ]]; then
        unzip -q "$TEMP_DIR/gitleaks.tar.gz" -d "$TEMP_DIR"
        mv "$TEMP_DIR/gitleaks.exe" "$INSTALL_DIR/gitleaks.exe"
    else
        tar -xzf "$TEMP_DIR/gitleaks.tar.gz" -C "$TEMP_DIR"
        mv "$TEMP_DIR/gitleaks" "$INSTALL_DIR/gitleaks"
    fi

    # Make executable
    chmod +x "$INSTALL_DIR/gitleaks" 2>/dev/null || true

    # Cleanup
    rm -rf "$TEMP_DIR"

    echo "✅ Gitleaks installed to: $INSTALL_DIR/gitleaks"

    # Add to PATH if not already there
    if [[ ":$PATH:" != *":$INSTALL_DIR:"* ]]; then
        echo ""
        echo "⚠️  Adding $INSTALL_DIR to PATH"

        SHELL_RC=""
        if [ -n "$ZSH_VERSION" ] || [ -f ~/.zshrc ]; then
            SHELL_RC="$HOME/.zshrc"
        elif [ -f ~/.bashrc ]; then
            SHELL_RC="$HOME/.bashrc"
        else
            SHELL_RC="$HOME/.profile"
        fi

        if ! grep -q "$INSTALL_DIR" "$SHELL_RC" 2>/dev/null; then
            echo "" >> "$SHELL_RC"
            echo "# Security tools path" >> "$SHELL_RC"
            echo "export PATH=\"$INSTALL_DIR:\$PATH\"" >> "$SHELL_RC"
            echo "✅ Added to $SHELL_RC"
            echo "   Run: source $SHELL_RC"
        fi
    fi

    echo ""
    gitleaks --version
    echo ""
}

# Function to install pre-commit
install_precommit() {
    echo "📦 Installing pre-commit..."

    # Check if Python/pip is available
    if command -v pip3 >/dev/null 2>&1; then
        pip3 install pre-commit --user
    elif command -v pip >/dev/null 2>&1; then
        pip install pre-commit --user
    elif command -v python3 >/dev/null 2>&1; then
        python3 -m pip install pre-commit --user
    elif command -v python >/dev/null 2>&1; then
        python -m pip install pre-commit --user
    else
        echo "❌ Python/pip not found. Please install Python first."
        return 1
    fi

    echo "✅ pre-commit installed"
    echo ""
}

# Function to install Husky
install_husky() {
    echo "📦 Installing Husky..."

    if ! command -v npm >/dev/null 2>&1; then
        echo "❌ npm not found. Please install Node.js first."
        return 1
    fi

    # Check if package.json exists
    if [ ! -f "package.json" ]; then
        echo "❌ package.json not found. Run from project root."
        return 1
    fi

    # Install husky if not already installed
    if ! grep -q '"husky"' package.json; then
        npm install --save-dev husky
    fi

    # Initialize husky
    npx husky install || npm run precommit-install

    echo "✅ Husky installed and configured"
    echo ""
}

# Main installation
main() {
    # Parse arguments
    INSTALL_ALL=true
    INSTALL_GITLEAKS=false
    INSTALL_PRECOMMIT=false
    INSTALL_HUSKY=false

    for arg in "$@"; do
        case $arg in
            --gitleaks-only)
                INSTALL_ALL=false
                INSTALL_GITLEAKS=true
                ;;
            --precommit-only)
                INSTALL_ALL=false
                INSTALL_PRECOMMIT=true
                ;;
            --husky-only)
                INSTALL_ALL=false
                INSTALL_HUSKY=true
                ;;
            --help)
                echo "Usage: $0 [options]"
                echo ""
                echo "Options:"
                echo "  --gitleaks-only     Install only Gitleaks"
                echo "  --precommit-only    Install only pre-commit"
                echo "  --husky-only        Install only Husky"
                echo "  --help              Show this help"
                echo ""
                echo "If no options specified, installs all tools."
                exit 0
                ;;
        esac
    done

    if [ "$INSTALL_ALL" = true ] || [ "$INSTALL_GITLEAKS" = true ]; then
        install_gitleaks
    fi

    if [ "$INSTALL_ALL" = true ] || [ "$INSTALL_PRECOMMIT" = true ]; then
        install_precommit
    fi

    if [ "$INSTALL_ALL" = true ] || [ "$INSTALL_HUSKY" = true ]; then
        install_husky
    fi

    echo "================================================"
    echo "  Installation Complete!"
    echo "================================================"
    echo ""
    echo "📋 Next Steps:"
    echo ""
    echo "1. Reload your shell:"
    echo "   source ~/.zshrc  # or ~/.bashrc"
    echo ""
    echo "2. Enable pre-commit hooks:"
    echo "   pre-commit install"
    echo ""
    echo "3. Test secret scanning:"
    echo "   npm run scan:secrets"
    echo ""
    echo "4. Verify pre-commit:"
    echo "   pre-commit run --all-files"
    echo ""
    echo "📚 Commands:"
    echo "  npm run scan:secrets      - Run gitleaks scan"
    echo "  npm run scan:install      - Install security tools"
    echo "  pre-commit run --all-files - Run all pre-commit hooks"
    echo ""
}

# Run main function
main "$@"
