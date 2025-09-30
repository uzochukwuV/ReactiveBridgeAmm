// SPDX-License-Identifier: MIT
pragma solidity ^0.8.10;

import "../../../lib/chainlink-brownie-contracts/contracts/src/v0.8/shared/interfaces/AggregatorV3Interface.sol";

contract TokenOracleRegistry {
    address public owner;
    mapping(address => address) public tokenFeeds;

    event FeedRegistered(address indexed token, address indexed feed);
    event FeedRemoved(address indexed token);

    modifier onlyOwner() {
        require(msg.sender == owner, "Not authorized");
        _;
    }

    constructor() {
        owner = msg.sender;
        tokenFeeds[0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238] = 0xA2F78ab2355fe2f984D808B5CeE7FD0A93D5270E;
        tokenFeeds[0x779877A7B0D9E8603169DdbD7836e478b4624789] = 0xc59E3633BAAC79493d908e63626716e204A45EdF;
    }

    function registerFeed(address token, address feed) external onlyOwner {
        require(token != address(0) && feed != address(0), "Zero address");
        tokenFeeds[token] = feed;
        emit FeedRegistered(token, feed);
    }

    function removeFeed(address token) external onlyOwner {
        require(tokenFeeds[token] != address(0), "Not registered");
        delete tokenFeeds[token];
        emit FeedRemoved(token);
    }

    function _getLatestPrice(address feed) internal view returns (int256) {
        (, int256 price, , ,) = AggregatorV3Interface(feed).latestRoundData();
        return price;
    }

    function _getDecimals(address feed) internal view returns (uint8) {
        return AggregatorV3Interface(feed).decimals();
    }

    function getTokenPrice(address token) public view returns (int256) {
        return _getLatestPrice(tokenFeeds[token]);
    }

    function getFeedPrice(address feed) public view returns (int256) {
        return _getLatestPrice(feed);
    }

    /**
     * @notice Convert amount of tokenA into equivalent tokenB amount
     * @param tokenA Source token address
     * @param tokenB Target token address  
     * @param amountA Amount in tokenA (in native token units)
     * @param decimalsA Token A's decimals (e.g., 6 for USDC, 18 for LINK)
     * @param decimalsB Token B's decimals
     * @return Amount in tokenB (in native token units)
     */
    function convertAmount(
        address tokenA,
        address tokenB,
        uint256 amountA,
        uint8 decimalsA,
        uint8 decimalsB
    ) public view returns (uint256) {
        address feedA = tokenFeeds[tokenA];
        address feedB = tokenFeeds[tokenB];
        require(feedA != address(0) && feedB != address(0), "Unverified token");

        int256 priceA = _getLatestPrice(feedA);
        int256 priceB = _getLatestPrice(feedB);
        require(priceA > 0 && priceB > 0, "Invalid price data");

        uint8 feedDecimalsA = _getDecimals(feedA);
        uint8 feedDecimalsB = _getDecimals(feedB);

        // Normalize prices to 18 decimals
        uint256 normalizedPriceA = uint256(priceA) * 10**(18 - feedDecimalsA);
        uint256 normalizedPriceB = uint256(priceB) * 10**(18 - feedDecimalsB);

        // Calculate value in USD (amountA * priceA)
        uint256 valueInUSD = amountA * normalizedPriceA;
        
        // Convert to tokenB (valueInUSD / priceB)
        uint256 amountB = valueInUSD / normalizedPriceB;
        
        // Adjust for token decimal differences
        if (decimalsB > decimalsA) {
            amountB = amountB * 10**(decimalsB - decimalsA);
        } else if (decimalsA > decimalsB) {
            amountB = amountB / 10**(decimalsA - decimalsB);
        }

        return amountB;
    }

    /**
     * @notice Get derived price of tokenA in terms of tokenB
     * @param tokenA Source token address
     * @param tokenB Target token address
     * @return Price ratio with 18 decimals
     */
    function getDerivedPrice(address tokenA, address tokenB) public view returns (uint256) {
        address feedA = tokenFeeds[tokenA];
        address feedB = tokenFeeds[tokenB];
        require(feedA != address(0) && feedB != address(0), "Unverified token");

        int256 priceA = _getLatestPrice(feedA);
        int256 priceB = _getLatestPrice(feedB);
        require(priceA > 0 && priceB > 0, "Invalid price data");

        uint8 decimalsA = _getDecimals(feedA);
        uint8 decimalsB = _getDecimals(feedB);

        // Normalize both prices to 18 decimals
        uint256 normalizedPriceA = uint256(priceA) * 10**(18 - decimalsA);
        uint256 normalizedPriceB = uint256(priceB) * 10**(18 - decimalsB);

        return (normalizedPriceA * 1e18) / normalizedPriceB;
    }

    function getTokenPriceWithDecimals(address token) public view returns (uint256 price, uint8 decimals) {
        address feed = tokenFeeds[token];
        require(feed != address(0), "Unverified token");

        int256 rawPrice = _getLatestPrice(feed);
        require(rawPrice > 0, "Invalid price data");

        price = uint256(rawPrice);
        decimals = _getDecimals(feed);
    }
}