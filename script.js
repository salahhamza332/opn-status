const connectButton = document.getElementById("connectButton");
const status = document.getElementById("status");

connectButton.addEventListener("click", async () => {
  if (!window.ethereum) {
    status.innerHTML = "<p>No EVM wallet detected.</p>";
    return;
  }

  try {
    const accounts = await window.ethereum.request({
      method: "eth_requestAccounts"
    });

    const account = accounts[0];

    const chainId = await window.ethereum.request({
      method: "eth_chainId"
    });

    status.innerHTML = `
      <p>Wallet: ${account}</p>
      <p>Network Chain ID: ${chainId}</p>
    `;

    connectButton.textContent = "Wallet Connected";
  } catch (error) {
    status.innerHTML = "<p>Connection cancelled or failed.</p>";
    console.error(error);
  }
});
