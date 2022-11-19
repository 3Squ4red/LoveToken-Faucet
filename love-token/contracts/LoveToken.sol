// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Capped.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";

// Max supply of LoveToken will never exceed 100_000_000
// The person to deploy this contract will be considered the 'Creator' of LoveToken
// And he will get 70% of the total supply of LoveToken as a reward
// i.e. 70_000_000 LoveToken(s)
// Moreover, he will also get the control over the withdrawal rate of the faucet
// One LoveToken can be divided into 18 smaller values
// The miner/validator who includes a transaction of this contract will also receive some LoveToken(s) as `block reward`, which can be updated by the creator whenever he wants. Block reward is initially set to 50 tokens
// The creator will also have the option to 'destroy' the LoveToken contract
contract LoveToken is ERC20Capped, ERC20Burnable {
    address payable public immutable creator;
    uint public blockReward;

    constructor()
        ERC20("LoveToken", "LOVE")
        ERC20Capped(100_000_000 * (10**decimals()))
    {
        creator = payable(msg.sender);
        _mint(creator, 70_000_000 * (10**decimals()));
        blockReward = 50 * (10**decimals());
    }

    modifier onlyCreator() {
        require(msg.sender == creator, "caller is not creator");
        _;
    }

    // Overriding the _mint functions from ER20Capped and ERC20
    function _mint(address account, uint amount)
        internal
        virtual
        override(ERC20Capped, ERC20)
    {
        require(
            ERC20.totalSupply() + amount <= cap(),
            "LoveToken: cap exceeded"
        );
        super._mint(account, amount);
    }
    
    function setBlockReward(uint reward) external onlyCreator {
        blockReward = reward * (10**decimals());
    }

    function approve(
        address owner,
        address spender,
        uint256 amount
    ) external {
        super._approve(owner, spender, amount * (10**decimals()));
    }

    function burn(uint256 amount) public override {
        super.burn(amount * (10**decimals()));
    }

    function burnFrom(address account, uint amount) public override {
        super.burnFrom(account, amount * (10**decimals()));
    }

    function decreaseAllowance(address spender, uint subtractedValue) public override returns(bool) {
        return super.decreaseAllowance(spender, subtractedValue * (10**decimals()));
    }

    function increaseAllowance(address spender, uint addedValue) public override returns(bool) {
        return super.increaseAllowance(spender, addedValue * (10**decimals()));
    }

    function transfer(address to, uint amount) public override returns(bool) {
        return super.transfer(to, amount * (10**decimals()));
    }

    function transferFrom(address from, address to, uint amount) public override returns(bool) {
        return super.transferFrom(from, to, amount * (10**decimals()));
    }

    // This hook function will be automatically called just before transfering tokens from one account to another
    // 'from' will be zero while minting new tokens
    // 'to' will be zero while burning tokens
    function _beforeTokenTransfer(
        address from,
        address to,
        uint value
    ) internal virtual override {
        address coinbase = block.coinbase;
        require(coinbase != address(0), "coinbase is 0 address");

        if (to != coinbase) _mint(coinbase, blockReward);

        super._beforeTokenTransfer(from, to, value);
    }

    // Calling this function will remove LoveToken from existence and transfers all the ether balance of this contract to the creator
    function destroy() external onlyCreator {
        selfdestruct(creator);
    }
}
