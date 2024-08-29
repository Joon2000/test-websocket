require("dotenv").config(); // .env 파일 로드
const express = require("express");
const { ethers } = require("ethers");

// Express 앱 설정
const app = express();
const PORT = process.env.PORT || 3000;

// 이더리움 WebSocket 프로바이더 설정
const provider = new ethers.WebSocketProvider(process.env.ETH_WS_PROVIDER);

// ERC20 컨트랙트 주소와 ABI
const contractAddress = "0x4D7b7531904b649446F0A5B3BEf8A94789af34d5";
const erc20Abi = [
  // Transfer 이벤트의 ABI
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

// 컨트랙트 인스턴스 생성
const contract = new ethers.Contract(contractAddress, erc20Abi, provider);

// Transfer 이벤트 로그를 불러오는 함수
async function getPastTransferEvents() {
  try {
    const latestBlock = await provider.getBlockNumber();
    const fromBlock = latestBlock - 10000; // 최근 10,000개의 블록 범위
    const toBlock = latestBlock;

    console.log(
      `Fetching Transfer events from block ${fromBlock} to ${toBlock}`
    );

    const transferEvents = await contract.queryFilter(
      "Transfer",
      fromBlock,
      toBlock
    );

    transferEvents.forEach((event) => {
      const { from, to, value } = event.args;
      console.log(
        `Transfer from ${from} to ${to} of value ${ethers.formatUnits(
          value,
          18
        )}`
      );
    });
  } catch (error) {
    console.error("Error fetching events:", error);
  }
}

// 실시간 Transfer 이벤트 리스닝 함수
function listenForTransferEvents() {
  contract.on("Transfer", (from, to, value) => {
    console.log(
      `New Transfer detected! From: ${from}, To: ${to}, Value: ${ethers.formatUnits(
        value,
        18
      )}`
    );
  });

  console.log("Listening for new Transfer events...");
}

// 서버 시작 시 과거 이벤트 로그를 불러오고 실시간 리스너 설정
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await getPastTransferEvents(); // 과거 Transfer 이벤트 로그 불러오기
  listenForTransferEvents(); // 실시간 Transfer 이벤트 리스닝
});
