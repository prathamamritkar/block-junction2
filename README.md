# Blockchain Junction 🔗

A **Cross-Chain Asset Swap Platform** built on the Internet Computer that enables users to securely exchange assets across different blockchain networks including ICP, Bitcoin, and Ethereum.

## 🌟 Features

- **Cross-Chain Swaps**: Exchange assets between ICP, Bitcoin, and Ethereum
- **Internet Identity Authentication**: Secure login using IC's native identity system
- **Real-time Balance Management**: Deposit, withdraw, and track your assets
- **Peer-to-Peer Matching**: Find and execute swaps with other users
- **Transaction History**: Complete audit trail of all your activities
- **Modern UI**: Responsive React frontend with beautiful gradients and animations

## 🏗️ Architecture

### Backend (Rust Canister)
- **Authentication**: Internet Identity integration with user verification
- **Asset Management**: Multi-chain balance tracking and updates
- **Swap Engine**: Create, match, and execute cross-chain swaps
- **Storage**: Persistent data storage using IC stable structures

### Frontend (React)
- **Context-based State Management**: AuthContext and BackendContext
- **Component Architecture**: Modular design with wallet, swap, and transaction components
- **Responsive Design**: Mobile-friendly interface with SCSS styling
- **Real-time Updates**: Live balance and swap status updates

## 🚀 Quick Start

### Prerequisites
- [DFX](https://internetcomputer.org/docs/current/developer-docs/setup/install) >= 0.15.0
- [Node.js](https://nodejs.org/) >= 16.0.0
- [Rust](https://rustup.rs/) (for backend development)

### Installation

1. **Clone the repository:**
```bash
git clone <repository-url>
cd block-junction
```

2. **Install dependencies:**
```bash
npm install
```

3. **Start the local IC replica:**
```bash
dfx start --background
```

4. **Deploy the canisters:**
```bash
dfx deploy
```

5. **Start the development server:**
```bash
npm start
```

The application will be available at `http://localhost:8080`

## 🎯 Usage

### 1. Authentication
- Click "Login with Internet Identity" to authenticate
- Your principal ID will be displayed in the header

### 2. Manage Assets
- **Deposit**: Add assets to your platform balance
- **Withdraw**: Send assets to external addresses
- **View Balances**: Check your holdings across all supported chains

### 3. Create Swaps
- Navigate to the "Create Swap" tab
- Specify the asset you want to trade and the desired asset
- Set swap duration and submit the request

### 4. Execute Swaps
- Browse "Pending Swaps" to find matching opportunities
- Execute compatible swaps with other users
- Monitor transaction status in real-time

## 📁 Project Structure

```
block-junction/
├── src/
│   ├── blockchain_junction_backend/src/     # Rust Backend
│   │   ├── lib.rs                          # Main canister entry point
│   │   ├── types.rs                        # Type definitions
│   │   ├── storage.rs                      # Data persistence
│   │   ├── auth.rs                         # Authentication logic
│   │   ├── swap.rs                         # Swap operations
│   │   └── utils.rs                        # Utility functions
│   │
│   └── blockchain_junction_frontend/src/   # React Frontend
│       ├── components/                     # UI Components
│       │   ├── Header/                     # Navigation header
│       │   ├── Dashboard/                  # Main dashboard
│       │   ├── WalletConnection/           # Asset management
│       │   ├── SwapSection/                # Swap interface
│       │   └── TransactionHistory/         # Transaction logs
│       ├── contexts/                       # React contexts
│       │   ├── AuthContext.jsx             # Authentication state
│       │   └── BackendContext.jsx          # Backend integration
│       └── App.jsx                         # Main application
└── README.md
```

## 🔧 Development

### Backend Development
```bash
# Build backend canister
dfx build blockchain_junction_backend

# Deploy only backend
dfx deploy blockchain_junction_backend

# Check canister logs
dfx canister logs blockchain_junction_backend
```

### Frontend Development
```bash
# Generate type declarations
dfx generate

# Start development server
npm run dev

# Build for production
npm run build
```

### Testing
```bash
# Run backend tests
cargo test

# Frontend testing (when tests are added)
npm test
```

## 🌐 Supported Assets

| Asset | Symbol | Chain | Status |
|-------|--------|-------|--------|
| Internet Computer | ICP | ICP | ✅ Active |
| Bitcoin | BTC | Bitcoin | ✅ Active |
| Ethereum | ETH | Ethereum | ✅ Active |

## 🔐 Security Features

- **Internet Identity Integration**: Secure, passwordless authentication
- **Principal-based Authorization**: User actions tied to cryptographic identity
- **Balance Verification**: Insufficient balance checks before operations
- **Deadline Management**: Time-limited swap requests
- **Atomic Swaps**: All-or-nothing transaction execution

## 🚧 Roadmap

- [ ] Real Bitcoin and Ethereum integration
- [ ] Advanced swap matching algorithms
- [ ] Transaction fee optimization
- [ ] Mobile application
- [ ] Additional blockchain support
- [ ] Liquidity pools
- [ ] Advanced analytics dashboard

## 📖 API Documentation

### Backend Methods

#### Authentication
- `login()` → `String` - Authenticate user with Internet Identity
- `get_caller_principal()` → `Principal` - Get current user's principal

#### Asset Management
- `deposit_asset(symbol: String, amount: u64)` → `String`
- `withdraw_asset(symbol: String, amount: u64, chain: Chain, address: String)` → `String`
- `get_balance(symbol: String)` → `u64`
- `get_all_balances()` → `BalanceResponse`

#### Swap Operations
- `create_swap_request(from_symbol: String, amount: u64, to_symbol: String, to_chain: Chain, duration: u64)` → `SwapResponse`
- `execute_swap(swap_id1: u64, swap_id2: u64)` → `SwapResponse`
- `get_pending_swaps()` → `Vec<SwapRequest>`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Internet Computer Documentation](https://internetcomputer.org/docs)
- [DFX SDK](https://internetcomputer.org/docs/current/developer-docs/setup/install)
- [Rust CDK](https://docs.rs/ic-cdk)
- [Internet Identity](https://identity.ic0.app/)

## 📧 Support

For questions and support, please open an issue in the repository or reach out to the development team.

---

**Built with ❤️ on the Internet Computer**
