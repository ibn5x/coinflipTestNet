const FlipContract = artifacts.require("FlipContract");

module.exports = async function(deployer) {
  await deployer.deploy(FlipContract);

  let instance = await FlipContract.deployed()
  //1000000000000000000 1 ETH
  instance.fundDapp({value: 100000000000000})

};