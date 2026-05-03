const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", ethers.formatEther(balance), "USDC");

  // 1. Deploy Factory
  console.log("\n📦 Deploying ArcFactory...");
  const Factory = await ethers.getContractFactory("ArcFactory");
  const factory = await Factory.deploy(deployer.address);
  await factory.waitForDeployment();
  const factoryAddr = await factory.getAddress();
  console.log("✅ ArcFactory:", factoryAddr);

  // 2. Deploy WUSDC
  console.log("\n📦 Deploying WUSDC...");
  const WUSDC = await ethers.getContractFactory("WUSDC");
  const wusdc = await WUSDC.deploy();
  await wusdc.waitForDeployment();
  const wusdcAddr = await wusdc.getAddress();
  console.log("✅ WUSDC:", wusdcAddr);

  // 3. Deploy Router
  console.log("\n📦 Deploying ArcRouter...");
  const Router = await ethers.getContractFactory("ArcRouter");
  const router = await Router.deploy(factoryAddr, wusdcAddr);
  await router.waitForDeployment();
  const routerAddr = await router.getAddress();
  console.log("✅ ArcRouter:", routerAddr);

  // 4. Print summary
  console.log("\n" + "═".repeat(50));
  console.log("🎉 DEPLOYMENT COMPLETE!");
  console.log("═".repeat(50));
  console.log(`\nFactory:  ${factoryAddr}`);
  console.log(`WUSDC:     ${wusdcAddr}`);
  console.log(`Router:    ${routerAddr}`);
  console.log(`\nNetwork:   Arc Testnet`);
  console.log(`Chain ID:  5042002`);
  console.log(`Explorer:  https://testnet.arcscan.app/address/${routerAddr}`);

  // 5. Write deployment addresses to file
  const fs = require("fs");
  const deployment = {
    network: "arc-testnet",
    chainId: 5042002,
    contracts: {
      factory: factoryAddr,
      wusdc: wusdcAddr,
      router: routerAddr,
    },
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync(
    __dirname + "/../deployment.json",
    JSON.stringify(deployment, null, 2)
  );
  console.log("\n📄 Deployment saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
