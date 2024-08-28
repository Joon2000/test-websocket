require("dotenv").config(); // .env 파일 로드
const express = require("express");
const { ethers } = require("ethers");

// Express 앱 설정
const app = express();
const PORT = process.env.PORT || 3000;

// 이더리움 HTTP 프로바이더 설정
const provider = new ethers.WebSocketProvider("ws://158.247.251.208:8546");

// ERC20 컨트랙트 주소와 ABI
const contractAddress = "0xfdA4F43958B4e73Aa270f44548fbb4A3514B2308";
const erc20Abi = [
  // Transfer 이벤트의 ABI
  "event Transfer(address indexed from, address indexed to, uint256 value)",
];

// 컨트랙트 인스턴스 생성
const contract = new ethers.Contract(contractAddress, erc20Abi, provider);

// Transfer 이벤트 로그를 불러오는 함수
async function getPastTransferEvents() {
  try {
    // 최신 블록의 번호를 가져옴
    const latestBlock = await provider.getBlockNumber();

    // 특정 블록 범위를 지정하여 이벤트 로그를 가져옴
    const fromBlock = latestBlock - 3000000; // 최근 10,000개의 블록 범위
    const toBlock = latestBlock;

    console.log(
      `Fetching Transfer events from block ${fromBlock} to ${toBlock}`
    );

    // Transfer 이벤트 로그를 가져옴
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

// 서버 시작 시 이벤트 로그를 불러옴
app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  await getPastTransferEvents();
});
