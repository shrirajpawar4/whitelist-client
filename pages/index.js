import Head from 'next/head'
import Image from 'next/image'
import styles from '../styles/Home.module.css'
import Web3Modal from 'web3modal'
import { useEffect, useRef, useState } from 'react'
import { Contract, providers } from 'ethers'
import { abi, WHITELIST_CONTRACT_ADDRESS } from '../constants'



export default function Home() {
const [numOfWhitelisted, setNumOfWhitlisted] = useState(0);
const [walletConnected, setWalletConnected] = useState(false);
const [joinedWhitelist, setJoinedWhitelist] = useState(false);
const [numberOfWhitelisted, setNumberOfWhitelisted] = useState(0);
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

const checkIfAddressWhitelisted = async () => {
  const signer = getProviderOrSigner(true);
  const whitelistContract = new Contract(
    WHITELIST_CONTRACT_ADDRESS,
    abi,
    signer
  );
  const address = await signer.getAddress(); 
  const _joinedWhitelist = await whitelistContract.whitelistedAddresses(
    address
  );
  setJoinedWhitelist(_joinedWhitelist)
};

const getNumberOfWhitelisted = async () => {
  try {
    const provider = getProviderOrSigner();

    const whitelistContract = new Contract (
      WHITELIST_CONTRACT_ADDRESS,
      abi,
      provider
    );
    const _numberOfWhitelisted = await whitelistContract.numAddressesWhitelisted();
    setNumOfWhitlisted(_numberOfWhitelisted);
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

const connectWalletButton = async() => {
  if (walletConnected) {
    if (joinedWhitelist) {
      return (
        <div className={styles.description}>
        Thanks for joining the waitlist. We'll update soon.
        </div>
      );
    } else if (loading) {
        return (
          <button className={styles.button} onClick={connectWalletS} >Join the waitlist</button>
        )
    }
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
    <h1 className={styles.title}>Welcome to Whitelist dapp</h1>
    <div className={styles.description}>
    {numOfWhitelisted} have already joined. What are you waiting for, join in!
    </div>
    <div>
    <img className={styles.image} src="./crypto.svg" />
    </div>
    </div>
    <footer className={styles.footer}>
    Made with &#10084; by Shree
    </footer>
    </>
  )
}
