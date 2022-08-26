import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Web3Modal from 'web3modal'
import { useEffect, useRef, useState } from 'react'
import { Contract, providers } from 'ethers'
import { abi, WHITELIST_CONTRACT_ADDRESS } from '../constants'



export default function Home() {
const [numOfWhitelisted, setNumOfWhitelisted] = useState(0);
const [walletConnected, setWalletConnected] = useState(false);
const [joinedWhitelist, setJoinedWhitelist] = useState(false);
const [loading, setLoading] = useState(false);
const web3ModalRef = useRef();

const getProviderOrSigner = async (needSigner = false) => {
  const provider = await web3ModalRef.current.connect();
  const web3Provider = new providers.Web3Provider(provider);

  const { chainId } = await web3Provider.getNetwork();
  if (chainId !== 4) {
    window.alert("Change network to rinkeby!");
    throw new Error ("Change network to rinkeby");
  }

  if (needSigner) {
    const signer = web3Provider.getSigner();
    return signer;
  }
  return web3Provider;
};

const checkIfAddressWhitelisted = async() => {
  try {
    const signer = getProviderOrSigner();

    const whitelistContract = new Contract(
      WHITELIST_CONTRACT_ADDRESS,
      abi,
      signer
    );
    const _joinedWhitelisted = await whitelistContract.whitelistedAddresses();
    setJoinedWhitelist(_joinedWhitelisted);
  } catch (error) {
    console.log(error);
  }
}

const getNumberOfWhitelisted = async () => {
  try {
    const provider = getProviderOrSigner();

    const whitelistContract = new Contract (
      WHITELIST_CONTRACT_ADDRESS,
      abi,
      provider
    );
    const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
    setNumOfWhitelisted(_numberOfWhitelisted);
  } catch (error) {
    console.log(error);
  }
}

const addAddressToWhitelist = async () => {
  try {
    const signer = await getProviderOrSigner();

    const whitelistContract = new Contract(
      WHITELIST_CONTRACT_ADDRESS,
      abi,
      signer
    );

    const tx = await whitelistContract.addAddressToWhitelist();
    setLoading(true);

    await tx.wait();
    setLoading(false);

    await getNumberOfWhitelisted();
    setJoinedWhitelist(true);
  } catch (error) {
    console.log(error);
  }
}

const connectWallet = async() => {
  try {
    await getProviderOrSigner();
    setWalletConnected(true);

    checkIfAddressWhitelisted();
    getNumberOfWhitelisted();
  } catch (error) {
    console.log(error);
  }
}

const connectWalletButton = () => {
  if (walletConnected) {
    if (joinedWhitelist) {
      return (
        <div className={styles.description}>
        Thanks for joining the waitlist. We'll update soon.
        </div>
      );
    } else if (loading) {
        return (
          <button className={styles.button}>Loading..</button>
        )
    } else {
      return (
        <button className={styles.button} onClick={addAddressToWhitelist}>Join the Whitelist</button>
      );
    }
  } else {
    return(
      <button className={styles.button} onClick={connectWallet}>Connect your wallet</button>
    )
  }
}

useEffect(() => {
if (!walletConnected) {
  web3ModalRef.current = new Web3Modal({
    network: "rinkeby",
    providerOptions: {},
    disableInjectedProvider: false,
  });
  connectWallet();
}
}, [walletConnected])


  return (
    <>
    <Head>
    <title>Whitelist Dapp</title>
    <meta name='description' content='Whitelist-Dapp' />
    </Head>
    <div className={styles.main}>
    <div>
      <h1 className={styles.title}>Welcome to Whitelist dapp </h1>
    </div>
    <div className={styles.description}>
    <div className={styles.description}>Get early access.</div>
    {numOfWhitelisted} have already joined!
    </div>
    {connectWalletButton()}
    <div>
      <img className={styles.image} src='./crypto.svg' />
    </div>
    </div>
    <footer className={styles.footer}>
    Made with &#10084; by Shreee
    </footer>
    </>
  )
}
