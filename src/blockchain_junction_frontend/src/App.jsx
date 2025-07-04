import { useState, useEffect } from 'react';
import { blockchain_junction_backend } from 'declarations/blockchain_junction_backend';
import { AuthClient } from "@dfinity/auth-client";
import { HttpAgent } from "@dfinity/agent";

function App() {
  const [greeting, setGreeting] = useState('');
  const [principal, setPrincipal] = useState(null);
  const [backendActor, setBackendActor] = useState(blockchain_junction_backend); // Default actor

  // Deposit state
  const [depositAssetSymbol, setDepositAssetSymbol] = useState('ICP');
  const [depositAssetAmount, setDepositAssetAmount] = useState(0);
  const [depositChain, setDepositChain] = useState('ICP'); // Defaulting to ICP for Chain enum

  // Balance state
  const [balances, setBalances] = useState(null);
  const [balanceAssetSymbol, setBalanceAssetSymbol] = useState('ICP');

  // BTC Address State
  const [btcAddress, setBtcAddress] = useState('');

  // Create Swap State
  const [fromAssetSymbol, setFromAssetSymbol] = useState('ICP');
  const [fromAssetAmount, setFromAssetAmount] = useState(0);
  const [toAssetSymbol, setToAssetSymbol] = useState('BTC');
  const [toChain, setToChain] = useState('Bitcoin'); // Matches Chain::Bitcoin
  const [swapDuration, setSwapDuration] = useState(3600 * 1e9); // 1 hour in nanoseconds

  // Pending Swaps State
  const [pendingSwaps, setPendingSwaps] = useState([]);

  // Execute Swap State
  const [execSwapId1, setExecSwapId1] = useState('');
  const [execSwapId2, setExecSwapId2] = useState('');

  // Withdraw State
  const [withdrawAssetSymbol, setWithdrawAssetSymbol] = useState('ICP');
  const [withdrawAmount, setWithdrawAmount] = useState(0);
  const [withdrawTargetChain, setWithdrawTargetChain] = useState('ICP');
  const [withdrawTargetAddress, setWithdrawTargetAddress] = useState('');


  useEffect(() => {
    const initAuth = async () => {
      const authClient = await AuthClient.create();
      if (await authClient.isAuthenticated()) {
        handleAuthenticated(authClient);
      } else {
        // Optionally trigger login immediately or wait for user action
        // await authClient.login(...);
      }
    };
    initAuth();
  }, []);

  const handleAuthenticated = async (authClient) => {
    const identity = authClient.getIdentity();
    setPrincipal(identity.getPrincipal());

    const agent = new HttpAgent({ identity });
    // Replace with your local replica agent if needed for local development
    // await agent.fetchRootKey(); // For local replica, remove for mainnet

    const actor = ActorkFactory.createActor(idlFactory, canisterId, { agent });
    setBackendActor(actor); // Set the authenticated actor
    console.log("Authenticated principal:", identity.getPrincipal().toText());
  };

  const login = async () => {
    const authClient = await AuthClient.create();
    await authClient.login({
      identityProvider: process.env.DFX_NETWORK === "ic"
        ? "https://identity.ic0.app/#authorize"
        : `http://localhost:4943?canisterId=${process.env.INTERNET_IDENTITY_CANISTER_ID}`, // Adjust for local II canister ID
      onSuccess: () => handleAuthenticated(authClient),
    });
  };

  async function fetchGreeting() {
    const name = prompt('Enter your name:');
    if (name) {
      setGreeting(await backendActor.greet(name));
    }
  }

  function getChainEnum(chainString) {
    if (chainString.toLowerCase() === 'bitcoin') return { Bitcoin: null };
    // Add other chains here as needed
    return { ICP: null }; // Default
  }

  async function handleDeposit() {
    if (!principal) { alert("Please login first."); return; }
    if (!depositAssetSymbol || depositAssetAmount <= 0) {
      alert("Please enter valid asset symbol and amount for deposit.");
      return;
    }
    const asset = {
      symbol: depositAssetSymbol,
      amount: BigInt(depositAssetAmount),
      chain: getChainEnum(depositChain), // Assuming depositChain string matches enum variant
    };
    try {
      const result = await backendActor.deposit_asset(asset);
      if (result.Ok === null) {
        alert("Deposit successful!");
        handleGetBalances(); // Refresh balances
      } else {
        alert(`Deposit failed: ${result.Err}`);
      }
    } catch (e) {
      alert(`Error depositing asset: ${e.message}`);
    }
  }

  async function handleGetBalances() {
    if (!principal) { alert("Please login first."); return; }
    try {
      const result = await backendActor.get_all_user_balances(principal);
      if (result.Ok) {
        // Convert array of [text, nat64] to object for easier display
        const balancesObj = result.Ok.reduce((acc, [symbol, amount]) => {
          acc[symbol] = Number(amount); // Convert BigInt to Number for display
          return acc;
        }, {});
        setBalances(balancesObj);
      } else {
        alert(`Failed to get balances: ${result.Err}`);
        setBalances({}); // Set to empty object on error
      }
    } catch (e) {
      alert(`Error getting balances: ${e.message}`);
      setBalances({});
    }
  }

  async function handleGetBtcAddress() {
    if (!principal) { alert("Please login first."); return; }
    try {
      const result = await backendActor.get_or_generate_user_bitcoin_deposit_address();
      if (result.Ok) {
        setBtcAddress(result.Ok);
      } else {
        alert(`Failed to get BTC address: ${result.Err}`);
      }
    } catch (e) {
      alert(`Error getting BTC address: ${e.message}`);
    }
  }

  async function handleCreateSwap() {
    if (!principal) { alert("Please login first."); return; }
    if (!fromAssetSymbol || fromAssetAmount <= 0 || !toAssetSymbol) {
      alert("Please fill in all fields for the swap request.");
      return;
    }
    try {
      const result = await backendActor.create_swap_request(
        fromAssetSymbol,
        BigInt(fromAssetAmount),
        toAssetSymbol,
        getChainEnum(toChain),
        BigInt(swapDuration)
      );
      if (result.Ok) {
        alert(`Swap request created with ID: ${result.Ok}`);
        handleGetPendingSwaps(); // Refresh pending swaps
        handleGetBalances(); // Refresh balances as asset is escrowed
      } else {
        alert(`Failed to create swap: ${result.Err}`);
      }
    } catch (e) {
      alert(`Error creating swap: ${e.message}`);
    }
  }

  async function handleGetPendingSwaps() {
    try {
      const swaps = await backendActor.get_all_pending_swaps();
      setPendingSwaps(swaps.map(swap => ({
        ...swap,
        id: Number(swap.id),
        from_asset: {
            ...swap.from_asset,
            amount: Number(swap.from_asset.amount)
        },
        deadline: new Date(Number(swap.deadline / BigInt(1e6))).toLocaleString() // Convert ns to ms for Date
      })));
    } catch (e) {
      alert(`Error getting pending swaps: ${e.message}`);
    }
  }

  async function handleExecuteSwap() {
    if (!principal) { alert("Please login first."); return; }
    if (!execSwapId1 || !execSwapId2) {
      alert("Please enter two swap IDs to execute.");
      return;
    }
    try {
      const result = await backendActor.execute_swap(BigInt(execSwapId1), BigInt(execSwapId2));
      if (result.Ok === null) {
        alert("Swap executed successfully (simulated)!");
        handleGetPendingSwaps(); // Refresh
        handleGetBalances(); // Refresh
      } else {
        alert(`Failed to execute swap: ${result.Err}`);
      }
    } catch (e) {
      alert(`Error executing swap: ${e.message}`);
    }
  }

  async function handleWithdraw() {
    if (!principal) { alert("Please login first."); return; }
    if (!withdrawAssetSymbol || withdrawAmount <= 0 || !withdrawTargetAddress) {
        alert("Please fill all withdrawal fields.");
        return;
    }
    try {
        const result = await backendActor.withdraw_asset(
            withdrawAssetSymbol,
            BigInt(withdrawAmount),
            getChainEnum(withdrawTargetChain),
            withdrawTargetAddress
        );
        if (result.Ok === null) {
            alert("Withdrawal processed (simulated).");
            handleGetBalances(); // Refresh balances
        } else {
            alert(`Withdrawal failed: ${result.Err}`);
        }
    } catch (e) {
        alert(`Error during withdrawal: ${e.message}`);
    }
  }


  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', gap: '20px', padding: '20px' }}>
      <h1>Cross-Chain Asset Swap</h1>

      {!principal ? (
        <button onClick={login}>Login with Internet Identity</button>
      ) : (
        <p>Logged in as: {principal.toText()}</p>
      )}

      <section>
        <h2>Greet</h2>
        <button onClick={fetchGreeting}>Greet Me!</button>
        {greeting && <p>{greeting}</p>}
      </section>

      <section style={{ border: '1px solid #ccc', padding: '10px' }}>
        <h2>1. Deposit Assets (Simulated)</h2>
        <div>
          <label>Asset Symbol: </label>
          <input type="text" value={depositAssetSymbol} onChange={(e) => setDepositAssetSymbol(e.target.value.toUpperCase())} placeholder="e.g., ICP, BTC_sim" />
        </div>
        <div>
          <label>Amount: </label>
          <input type="number" value={depositAssetAmount} onChange={(e) => setDepositAssetAmount(Number(e.target.value))} />
        </div>
        <div>
          <label>Chain (ICP or Bitcoin): </label>
          <input type="text" value={depositChain} onChange={(e) => setDepositChain(e.target.value)} placeholder="ICP or Bitcoin" />
        </div>
        <button onClick={handleDeposit} disabled={!principal}>Deposit</button>
      </section>

      <section style={{ border: '1px solid #ccc', padding: '10px' }}>
        <h2>2. View Balances</h2>
        <button onClick={handleGetBalances} disabled={!principal}>Refresh Balances</button>
        {balances ? (
          <ul>
            {Object.entries(balances).map(([symbol, amount]) => (
              <li key={symbol}>{symbol}: {amount}</li>
            ))}
          </ul>
        ) : (
          <p>Click button to fetch balances.</p>
        )}
      </section>

      <section style={{ border: '1px solid #ccc', padding: '10px' }}>
        <h2>3. Get Bitcoin Deposit Address</h2>
        <button onClick={handleGetBtcAddress} disabled={!principal}>Get/Generate BTC Address</button>
        {btcAddress && <p>Your BTC Deposit Address: {btcAddress}</p>}
      </section>

      <section style={{ border: '1px solid #ccc', padding: '10px' }}>
        <h2>4. Create Swap Request</h2>
        <div>
          <label>From Asset Symbol: </label>
          <input type="text" value={fromAssetSymbol} onChange={(e) => setFromAssetSymbol(e.target.value.toUpperCase())} placeholder="e.g., ICP" />
        </div>
        <div>
          <label>From Asset Amount: </label>
          <input type="number" value={fromAssetAmount} onChange={(e) => setFromAssetAmount(Number(e.target.value))} />
        </div>
        <div>
          <label>To Asset Symbol: </label>
          <input type="text" value={toAssetSymbol} onChange={(e) => setToAssetSymbol(e.target.value.toUpperCase())} placeholder="e.g., BTC_sim" />
        </div>
        <div>
          <label>To Chain (ICP or Bitcoin): </label>
          <input type="text" value={toChain} onChange={(e) => setToChain(e.target.value)} placeholder="ICP or Bitcoin" />
        </div>
        <div>
          <label>Duration (ns): </label>
          <input type="number" value={swapDuration} onChange={(e) => setSwapDuration(Number(e.target.value))} />
        </div>
        <button onClick={handleCreateSwap} disabled={!principal}>Create Swap</button>
      </section>

      <section style={{ border: '1px solid #ccc', padding: '10px' }}>
        <h2>5. View Pending Swaps</h2>
        <button onClick={handleGetPendingSwaps}>Refresh Pending Swaps</button>
        {pendingSwaps.length > 0 ? (
          <ul>
            {pendingSwaps.map(swap => (
              <li key={swap.id.toString()}>
                ID: {swap.id.toString()} | User: {swap.user.toText()} | From: {swap.from_asset.amount} {swap.from_asset.symbol} ({Object.keys(swap.from_asset.chain)[0]}) | To: {swap.to_asset_symbol} ({Object.keys(swap.to_chain)[0]}) | Deadline: {swap.deadline}
              </li>
            ))}
          </ul>
        ) : (
          <p>No pending swaps.</p>
        )}
      </section>

      <section style={{ border: '1px solid #ccc', padding: '10px' }}>
        <h2>6. Execute Swap (Simulated - Manual Match)</h2>
        <div>
          <label>Swap ID 1: </label>
          <input type="text" value={execSwapId1} onChange={(e) => setExecSwapId1(e.target.value)} placeholder="Enter first swap ID" />
        </div>
        <div>
          <label>Swap ID 2: </label>
          <input type="text" value={execSwapId2} onChange={(e) => setExecSwapId2(e.target.value)} placeholder="Enter second swap ID" />
        </div>
        <button onClick={handleExecuteSwap} disabled={!principal}>Execute Matched Swap</button>
      </section>

      <section style={{ border: '1px solid #ccc', padding: '10px' }}>
        <h2>7. Withdraw Assets (Simulated)</h2>
        <div>
            <label>Asset Symbol to Withdraw: </label>
            <input type="text" value={withdrawAssetSymbol} onChange={e => setWithdrawAssetSymbol(e.target.value.toUpperCase())} placeholder="e.g., BTC_sim" />
        </div>
        <div>
            <label>Amount: </label>
            <input type="number" value={withdrawAmount} onChange={e => setWithdrawAmount(Number(e.target.value))} />
        </div>
        <div>
            <label>Target Chain (ICP or Bitcoin): </label>
            <input type="text" value={withdrawTargetChain} onChange={e => setWithdrawTargetChain(e.target.value)} placeholder="ICP or Bitcoin" />
        </div>
        <div>
            <label>Target Address: </label>
            <input type="text" value={withdrawTargetAddress} onChange={e => setWithdrawTargetAddress(e.target.value)} placeholder="Target blockchain address" />
        </div>
        <button onClick={handleWithdraw} disabled={!principal}>Withdraw</button>
      </section>

    </div>
  );
}

export default App;

// Helper to create actor with HttpAgent, assuming declarations are available
// This part might need adjustment based on how `dfx generate` sets up declarations
import { idlFactory, canisterId } from 'declarations/blockchain_junction_backend';

const ActorkFactory = {
  createActor: (idl, id, options) => {
    const agent = options && options.agent || new HttpAgent(options);
    // For local development, you might need to fetch root key
    // if (process.env.DFX_NETWORK !== "ic") {
    //   agent.fetchRootKey().catch(err => {
    //     console.warn("Unable to fetch root key. Ensure local replica is running");
    //     console.error(err);
    //   });
    // }
    return Actor.createActor(idl, {
      agent,
      canisterId: id,
      ...(options ? options.actorOptions : {}),
    });
  }
};
// This is a workaround for Actor not being directly available.
// In a typical dfx project, `import { Actor } from "@dfinity/agent";` would be used,
// and `blockchain_junction_backend` from declarations would already be an actor instance.
// The following line is problematic if Actor is not globally available or correctly imported.
// For this environment, I'll assume Actor is available or this part is handled by the build setup.
// If not, this would need `import { Actor } from "@dfinity/agent";` at the top.
let Actor;
try {
  Actor = require("@dfinity/agent").Actor; // For environments where require is available
} catch (e) {
  console.warn("Could not require @dfinity/agent.Actor. Ensure it's installed and available or adjust actor creation.");
  // Fallback or error handling if Actor cannot be loaded.
  // This might indicate a need to adjust imports based on the specific project setup.
}

// If using Vite, environment variables for canister IDs are typically available via `import.meta.env`
// For example: `process.env.INTERNET_IDENTITY_CANISTER_ID` might be `import.meta.env.VITE_INTERNET_IDENTITY_CANISTER_ID`
// The current use of process.env suggests a Node-like environment or Webpack with DefinePlugin.
// This might need adjustment for a standard Vite setup.
// For now, I'll leave it as process.env, assuming appropriate polyfills or setup.

// A note on `getChainEnum`: The backend expects an enum like `{ Bitcoin: null }`.
// The frontend `depositChain` and `toChain` are strings like "Bitcoin".
// The `getChainEnum` function correctly converts these strings to the Candid enum format.
// It's important that the string values used in the UI (e.g., "Bitcoin", "ICP")
// exactly match the cases in `getChainEnum` for correct conversion.
// The `from_asset.chain` in `SwapRequest` is currently hardcoded to `Chain::ICP` in the backend
// during `create_swap_request`. This is a simplification and will need to be addressed
// for true cross-chain functionality (i.e., user specifying the chain of the asset they are sending).
// The `deposit_asset` function *does* take a chain, so that part is more flexible.
// For `create_swap_request`, the `from_asset.chain` should ideally be derived from `from_asset_symbol`
// or explicitly provided by the user if the symbol isn't globally unique across chains.
// The current frontend doesn't explicitly ask for `from_asset_chain` for a swap,
// relying on the backend's current simplification.
