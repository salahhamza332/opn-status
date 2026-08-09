const connectButton = document.getElementById("connectButton");
const status = document.getElementById("status");

const OPN_CHAIN_ID = "0x3d8";

const OPN_NETWORK = {
  chainId: OPN_CHAIN_ID,
  chainName: "OPN Testnet",
  nativeCurrency: {
    name: "OPN",
    symbol: "OPN",
    decimals: 18
  },
  rpcUrls: ["https://testnet-rpc.iopn.tech"],
  blockExplorerUrls: ["https://testnet.iopn.tech"]
};

async function switchToOPN() {
  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: OPN_CHAIN_ID }]
    });
  } catch (error) {
    // 4902 = network is not added to the wallet
    if (error.code === 4902) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [OPN_NETWORK]
      });
    } else {
      throw error;
    }
  }
}

async function updateWallet(account) {
  const chainId = await window.ethereum.request({
    method: "eth_chainId"
  });

  if (chainId !== OPN_CHAIN_ID) {
    status.innerHTML = `
      <p>Wallet: ${account}</p>
      <p>Network: Wrong Network</p>
      <p>Please switch to OPN Testnet.</p>
    `;
    return;
  }

  const balance = await window.ethereum.request({
    method: "eth_getBalance",
    params: [account, "latest"]
  });

  const balanceInOPN =
    Number.parseInt(balance, 16) / 1e18;

  status.innerHTML = `
    <p>Wallet: ${account}</p>
    <p>Network: OPN Testnet</p>
    <p>Balance: ${balanceInOPN} OPN</p>
    <p>
      <a
        href="https://testnet.iopn.tech/address/${account}"
        target="_blank"
        rel="noopener noreferrer"
      >
        View on Explorer
      </a>
    </p>
  `;

  connectButton.textContent = "OPN Wallet Connected";
}

connectButton.addEventListener("click", async () => {
  if (!window.ethereum) {
    status.innerHTML = `
      <p>No EVM wallet detected.</p>
      <p>Please open this site inside an EVM wallet browser.</p>
    `;
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    const account = accounts[0];

    await switchToOPN();

    await updateWallet(account);
  } catch (error) {
    console.error(error);

    status.innerHTML = `
      <p>Connection failed.</p>
      <p>Please try again.</p>
    `;
  }
});

if (window.ethereum) {
  window.ethereum.on("accountsChanged", (accounts) => {
    if (accounts.length === 0) {
      connectButton.textContent = "Connect Wallet";
      status.innerHTML = `
        <p>Wallet: Not connected</p>
        <p>Network: Not connected</p>
      `;
    } else {
      updateWallet(accounts[0]);
    }
  });

  window.ethereum.on("chainChanged", () => {
    window.location.reload();
  });
}
