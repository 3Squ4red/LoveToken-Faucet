// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

interface ILoveFaucet {
    function transfer(address to, uint amount) external returns (bool);

    function balanceOf(address account) external view returns (uint256);

    function creator() external view returns (address payable);
}

// This is a faucet contract which could be used to receive 20 LoveTokens every 24 hours
// The `creator` i.e. the deployer of the LoveToken contract could change the amount of tokens
// that could be withdrawn at a time AND the duration between each withdrawal
// By default the withdrawal period is 24 hours
contract LoveFaucet {
    event TokensDonated(address receiver, uint amount);
    error TooSoonWithdrawal(uint nextWithdrawalTime);

    ILoveFaucet public loveToken =
        ILoveFaucet(0x0203b585f090C7Fd0694003f098cbe0A1F5dbFab);
    uint public withdrawalAmount = 20;
    uint public withdrawalPeriod = 24 hours;
    // mapping to record the last withdrawal timing of an address
    mapping(address=>uint) private withdrawalTime;

    modifier onlyCreator {
        require(msg.sender == loveToken.creator(), "caller is not token creator");
        _;
    }

    // Reverts with the next withdrawal time when a person calls this function
    // within 24 hours of getting tokens
    // Reverts if this contract doesn't have enough tokens
    function getTokens() external {
        // Amount of tokens to be sent to the receiver
        uint amount = withdrawalAmount;

        require(getLoveBalance() >= amount * (10**18), "faucet doesn't have enough tokens");

        address receiver = msg.sender;
        uint lastWithdrawTime = withdrawalTime[receiver];
        uint period = withdrawalPeriod;

        if(block.timestamp-lastWithdrawTime < period)
            revert TooSoonWithdrawal(lastWithdrawTime+period);

        withdrawalTime[receiver] = block.timestamp;
        loveToken.transfer(receiver, amount);

        emit TokensDonated(receiver, amount);
    }

    function getLoveBalance() public view returns(uint) {
        return loveToken.balanceOf(address(this));
    }

    function updateWithdrawalAmount(uint newAmount) external onlyCreator {
        require(newAmount > 0 && newAmount <= getLoveBalance(),
        "invalid withdrawal amount");

        withdrawalAmount = newAmount;
    }

    // `newPeriod` represents a time and should be in seconds only
    function updateWithdrawalPeriod(uint newPeriod) external onlyCreator {
        require(newPeriod >= 1 seconds, "withdrawal period should be at least 1 second");

        withdrawalPeriod = newPeriod;
    }

    // A person can call this function to know his next withdrawal time
    // Returns 0 if the caller haven't ever withdrawan from the faucet
    function getLastWithdrawalTime() external view returns(uint) {
        uint lastWithdrawTime = withdrawalTime[msg.sender];
        if(lastWithdrawTime == 0)
            return 0;

        return lastWithdrawTime+withdrawalPeriod;
    }
}
