import { abi, contractAddress } from "./constants.js"
import { ethers } from "./ethers-5.2.umd.min.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
var balanceInfo = document.getElementById("balanceInfo")
const withdrawButton = document.getElementById("withdrawButton")

// actions
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
console.log(ethers)
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum != "undefined") {
        await ethereum.request({ method: "eth_requestAccounts" })
        document.getElementById("connectButton").innerHTML = "Connected!"
    } else {
        document.getElementById("connectButton").innerHTML =
            "Please Install Metamask!"
    }
}

async function getBalance() {
    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(
            `Current Contract Balance is: ${ethers.utils.formatEther(balance)}`
        )
        balanceInfo.innerHTML = ethers.utils.formatEther(balance)
    }
}

async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log("----------------------")
    console.log(`Funding with ${ethAmount} ETH`)
    // to fund we need a min. of
    // provider / connection to blockchain
    // signer / wallet / someone with gas
    // contract to interact with
    // ^ ABI & Address
    const provider = new ethers.providers.Web3Provider(window.ethereum)
    const signer = provider.getSigner() // returns wallet connected to provider
    // need ABI & address for getting contract details
    const contract = new ethers.Contract(contractAddress, abi, signer)

    // making transactions now
    try {
        const transactionResponse = await contract.fund({
            value: ethers.utils.parseEther(ethAmount),
        })
        // listen for tx to be mined
        await listenForTransactionMine(transactionResponse, provider)
        console.log("Success!")
    } catch (error) {
        console.log("Some error occurred...", error)
    }
    console.log("----------------------")
}

// non-async function
function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    // listen for the transaction to finish
    // provider.once starts its own process
    // it exits from the await listenForTransactionMine
    // hence we tackle this in a different way
    // using a promise
    return new Promise((resolve, reject) => {
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            console.log(
                `Completed with ${transactionReceipt.confirmations} confirmations`
            ) // gives no. of block confirmations
            // resolve only once this provider.once
            // function is complete and
            // transactionReceipt.hash is found
            // hence, including resolve inside this
            resolve()
        })
    })
}

async function withdraw() {
    console.log("----------------------")
    console.log("Withdraw in progress...")

    if (typeof window.ethereum != "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)

        try {
            const transactionResponse = await contract.withdraw()
            await listenForTransactionMine(transactionResponse, provider)
            console.log("Withdraw successful!")
        } catch (error) {
            console.log("Withdraw failed due to error: ", error)
        }
    }

    console.log("----------------------")
}
