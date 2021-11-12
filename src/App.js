import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { connect } from "./redux/blockchain/blockchainActions";
import { fetchData } from "./redux/data/dataActions";
import * as s from "./styles/globalStyles";
import styled from "styled-components";

const truncate = (input, len) =>
    input.length > len ? `${input.substring(0, len)}...` : input;

export const StyledButton = styled.button `
  padding: 10px;
  border-radius: 40px;
  border: none;
  background-color: var(--secondary);
  padding: 10px;
  font-weight: bold;
  color: var(--secondary-text);
  width: 150px;
  cursor: pointer;
  box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 6px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const StyledRoundButton = styled.button `
  padding: 10px;
  border-radius: 100%;
  border: none;
  background-color: var(--primary);
  padding: 10px;
  font-weight: bold;
  font-size: 15px;
  color: var(--primary-text);
  width: 30px;
  height: 30px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -webkit-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  -moz-box-shadow: 0px 4px 0px -2px rgba(250, 250, 250, 0.3);
  :active {
    box-shadow: none;
    -webkit-box-shadow: none;
    -moz-box-shadow: none;
  }
`;

export const ResponsiveWrapper = styled.div `
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: stretched;
  align-items: stretched;
  width: 100%;
  @media (min-width: 767px) {
    flex-direction: row;
  }
`;

export const StyledLogo = styled.img `
  width: 200px;
  @media (min-width: 767px) {
    width: 300px;
  }
  transition: width 0.5s;
  transition: height 0.5s;
`;

export const StyledImg = styled.img `
  box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0);
  border: none;
  background-color: var(--accent);
  border-radius: 0%;
  width: 200px;
  @media (min-width: 900px) {
    width: 250px;
  }
  @media (min-width: 1000px) {
    width: 300px;
  }
  transition: width 0.5s;
`;

export const StyledLink = styled.a `
  color: var(--secondary);
  text-decoration: none;
`;

function App() {
    const dispatch = useDispatch();
    const blockchain = useSelector((state) => state.blockchain);
    const data = useSelector((state) => state.data);
    const [claimingNft, setClaimingNft] = useState(false);
    const [feedback, setFeedback] = useState(`Click buy to mint your NFT.`);
    const [mintAmount, setMintAmount] = useState(1);
    const [CONFIG, SET_CONFIG] = useState({
        CONTRACT_ADDRESS: "",
        SCAN_LINK: "",
        NETWORK: {
            NAME: "",
            SYMBOL: "",
            ID: 0,
        },
        NFT_NAME: "",
        SYMBOL: "",
        MAX_SUPPLY: 1,
        WEI_COST: 0,
        DISPLAY_COST: 0,
        GAS_LIMIT: 0,
        MARKETPLACE: "",
        MARKETPLACE_LINK: "",
        SHOW_BACKGROUND: false,
    });

    const claimNFTs = () => {
        let cost = CONFIG.WEI_COST;
        let gasLimit = CONFIG.GAS_LIMIT;
        let totalCostWei = String(cost * mintAmount);
        let totalGasLimit = String(gasLimit * mintAmount);
        console.log("Cost: ", totalCostWei);
        console.log("Gas limit: ", totalGasLimit);
        setFeedback(`Minting your ${CONFIG.NFT_NAME}...`);
        setClaimingNft(true);
        blockchain.smartContract.methods
            .mint(mintAmount)
            .send({
                gasLimit: String(totalGasLimit),
                to: CONFIG.CONTRACT_ADDRESS,
                from: blockchain.account,
                value: totalCostWei,
            })
            .once("error", (err) => {
                console.log(err);
                setFeedback("Sorry, something went wrong please try again later.");
                setClaimingNft(false);
            })
            .then((receipt) => {
                console.log(receipt);
                setFeedback(
                    `WOW, the ${CONFIG.NFT_NAME} is yours! go visit Opensea.io to view it.`
                );
                setClaimingNft(false);
                dispatch(fetchData(blockchain.account));
            });
    };

    const decrementMintAmount = () => {
        let newMintAmount = mintAmount - 1;
        if (newMintAmount < 1) {
            newMintAmount = 1;
        }
        setMintAmount(newMintAmount);
    };

    const incrementMintAmount = () => {
        let newMintAmount = mintAmount + 1;
        if (newMintAmount > 10) {
            newMintAmount = 10;
        }
        setMintAmount(newMintAmount);
    };

    const getData = () => {
        if (blockchain.account !== "" && blockchain.smartContract !== null) {
            dispatch(fetchData(blockchain.account));
        }
    };

    const getConfig = async() => {
        const configResponse = await fetch("/config/config.json", {
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
        });
        const config = await configResponse.json();
        SET_CONFIG(config);
    };

    useEffect(() => {
        getConfig();
    }, []);

    useEffect(() => {
        getData();
    }, [blockchain.account]);

  return (
    <s.Screen>

        { /* Header section */ } 
        <s.Container 
            flex = { 1 }
            fd = { "column" }
            jc = { "space-between" }
            ai = { "right" }
            style = {
                { 
                    padding: 20,
                    backgroundColor: "#ABF0D1"
                }
            }
        >
            <s.Container flex = { 1 }
                fd = { "row" }
                jc = { "space-between" }
                ai = { "right" }
                style = {
                    { 
                        padding: 20,
                        backgroundColor: "#ABF0D1"
                    }
                }
            >
                <s.TextTitle style = {
                    { textAlign: "right",
                      fontSize: 25,
                      color: "var(--accent-text)",
                    }
                } >
                    Follow On 
                </s.TextTitle> 
                <StyledImg 
                    alt = { "Booger Bellys" }
                    src = { "/config/images/booger_belly_assets/logos/twitter_logo.png" }
                    style = {
                        { 
                            width: "3vw",
                            height: "3vh",
                            backgroundColor: "#ABF0D1",
                            justifyContent: "center",
                            alignSelf: "center"
                        }
                    }
                /> 
                <StyledButton 
                    style = {
                        { 
                            color: "#000000",
                            backgroundColor: "#FFFFFF"
                        }
                    }
                    onClick = {(e) => {
                        e.preventDefault();
                        dispatch(connect());
                        getData();
                    }}
                >
                    Connect Wallet 
                </StyledButton> 
                {blockchain.errorMsg !== "" ? (
                <>
                    <s.SpacerSmall / >
                    <s.TextDescription
                        style = {
                            {
                                textAlign: "center",
                                color: "var(--accent-text)"
                            }
                        } 
                    > { blockchain.errorMsg } 
                    </s.TextDescription> 
                </>
                ) : null} 
            </s.Container> 
            <s.SpacerSmall/>

            { /* Below header */ }
            <StyledImg
                alt = { "Kind Mints" }
                src = { "/config/images/booger_belly_assets/text/kind_mints_title.png" }
                style = {
                    { 
                        backgroundColor: "#ABF0D1",
                        justifyContent: "center",
                        alignSelf: "center"
                    }
                }
            />
            <s.SpacerSmall/>
            <StyledImg
                alt = { "Kind Mints" }
                src = { "/config/images/booger_belly_assets/text/mint_art_do_good.png" }
                style = {
                    { 
                        backgroundColor: "#ABF0D1",
                        justifyContent: "center",
                        alignSelf: "center"
                    }
                }
            /> 
        </s.Container>

        { /* Main body - 1st section */ }
        <s.Container 
            flex = { 1 }
            ai = { "left" }
            style = {
                { 
                    padding: 24,
                    backgroundColor: "#FFCF83" 
                }
            }
        >
            <s.Container
                flex = { 2 }
                fd = { "row" }
                jc = { "flex-end" }
                ai = { "center" }
            >
                <StyledImg 
                    flex = { 1.5 }
                    alt = { "Booger Bellys" }
                    src = { "/config/images/booger_belly_assets/text/booger_bellys_section.png" }
                    style = {
                        { 
                            backgroundColor: "#FFCF83",
                            justifyContent: "center",
                            alignSelf: "center"
                        }
                    }
                />
                <s.TextTitle
                    flex = { 1 }
                    style = {
                        { 
                            textAlign: "center",
                            fontSize: 25,
                            fontWeight: "bold",
                            color: "var(--accent-text)",
                        }
                    } 
                > 
                { data.totalSupply } / {CONFIG.MAX_SUPPLY} 
                </s.TextTitle> 
            </s.Container>

        { /* Section containing text */ }
        <ResponsiveWrapper 
            flex = { 1 }
            style = {
                { 
                    padding: 0
                }
            }
            test
        >
            <s.Container 
                flex = { 2 }
                jc = { "center" }
                ai = { "center" }
                style = {
                    {
                        backgroundColor: "#FFCF83",
                        padding: 0,
                        borderRadius: 0,
                        border: "4px var(--secondary)",
                    }
                }
            >
                <StyledImg 
                    alt = { "Booger Bellys" }
                    src = { "/config/images/booger_belly_assets/text/vibrant_insatiable.png" }
                    style = {
                        { 
                            backgroundColor: "#FFCF83",
                            alignSelf: "center"
                        }
                    }
                /> 
                <StyledImg
                    alt = { "Booger Bellys" }
                    src = { "/config/images/booger_belly_assets/buttons/mint_button.png" }
                    style = {
                        { 
                            backgroundColor: "#FFCF83",
                            alignSelf: "center"
                        }
                    }
                />
                <s.SpacerSmall/>
                {
                    Number(data.totalSupply) >= CONFIG.MAX_SUPPLY ? (
                        <>
                            <s.TextTitle 
                                style = {
                                    { 
                                        textAlign: "center",
                                        color: "var(--accent-text)"
                                    }
                                }
                            >
                                The sale has ended.
                            </s.TextTitle>
                            <s.TextDescription 
                                style = {
                                    { 
                                        textAlign: "center",
                                        color: "var(--accent-text)"
                                    }
                                }
                            >
                            You can still find { CONFIG.NFT_NAME } on 
                            </s.TextDescription>
                            <s.SpacerSmall/>
                            <StyledLink target = { "_blank" }
                                href = { CONFIG.MARKETPLACE_LINK }
                            > 
                                { CONFIG.MARKETPLACE } 
                            </StyledLink>
                        </>
                    ) : (
                        <>
                            <s.TextTitle 
                                style = {
                                    { 
                                        textAlign: "center",
                                        color: "var(--accent-text)" 
                                    }
                                } 
                            > 
                                1 {CONFIG.SYMBOL} costs { CONFIG.DISPLAY_COST } { " " } { CONFIG.NETWORK.SYMBOL } 
                            </s.TextTitle> 
                            <s.SpacerXSmall/>
                            <s.TextDescription 
                                style = {
                                    { 
                                        textAlign: "center",
                                        color: "var(--accent-text)" 
                                    }
                                }
                            > 
                                Excluding gas fees. 
                            </s.TextDescription> 
                            <s.SpacerSmall / >

                            { blockchain.account === "" || blockchain.smartContract === null ? (
                                <s.Container ai={"center"} jc={"center"}>
                                <s.TextDescription
                                  style={{
                                    textAlign: "center",
                                    color: "var(--accent-text)",
                                  }}
                                >
                                  Connect to the {CONFIG.NETWORK.NAME} network
                                </s.TextDescription>
                                <s.SpacerSmall />
                                <StyledButton
                                  onClick={(e) => {
                                    e.preventDefault();
                                    dispatch(connect());
                                    getData();
                                  }}
                                >
                                  CONNECT
                                </StyledButton>
                                {blockchain.errorMsg !== "" ? (
                                  <>
                                    <s.SpacerSmall />
                                    <s.TextDescription
                                      style={{
                                        textAlign: "center",
                                        color: "var(--accent-text)",
                                      }}
                                    >
                                      {blockchain.errorMsg}
                                    </s.TextDescription>
                                  </>
                                ) : null}
                              </s.Container>
                    ) : ( 
                        <>
                            <s.TextDescription style = {
                                {
                                    textAlign: "center",
                                    color: "var(--accent-text)",
                                }
                            } > 
                                { feedback } 
                            </s.TextDescription> 
                            <s.SpacerMedium / >
                            <s.Container 
                                ai = { "center" }
                                jc = { "center" }
                                fd = { "row" }
                            >
                                <StyledRoundButton 
                                    style = {
                                        { 
                                            lineHeight: 0.4
                                        }
                                    }
                                    disabled = { claimingNft ? 1 : 0 }
                                    onClick = {(e) => 
                                        {
                                            e.preventDefault();
                                            decrementMintAmount();
                                        }
                                    }
                                >
                                    {/* This might be an issue */ }
                                    -
                                </StyledRoundButton> 
                                <s.SpacerMedium/>
                                <s.TextDescription 
                                    style = {
                                        {
                                            textAlign: "center",
                                            color: "var(--accent-text)",
                                        }
                                    } 
                                > 
                                    { mintAmount } 
                                </s.TextDescription> 
                                <s.SpacerMedium/>
                                <StyledRoundButton 
                                    disabled = { claimingNft ? 1 : 0 }
                                    onClick = {
                                        (e) => {
                                            e.preventDefault();
                                            incrementMintAmount();
                                        }
                                    }
                                > 
                                    + 
                                </StyledRoundButton> 
                            </s.Container> 
                            <s.SpacerSmall/>
                            <s.Container 
                                ai = { "center" }
                                jc = { "center" }
                                fd = { "row" } 
                            >
                                <StyledButton 
                                    disabled = { claimingNft ? 1 : 0 }
                                    onClick = {
                                        (e) => {
                                            e.preventDefault();
                                            claimNFTs();
                                            getData();
                                        }
                                    }
                                > 
                                    { claimingNft ? "BUSY" : "BUY" } 
                                </StyledButton> 
                            </s.Container> 
                        </>
                    )
                } 
            </>
            )} 
            <s.SpacerMedium/>
        </s.Container>


        { /* Logo for donations */ } 
        <StyledImg
            alt = { "Dark Booger" }
            src = { "/config/images/booger_belly_assets/logos/feed_logo.png" }
            style = {
                { 
                    backgroundColor: "#FFCF83",
                    justifyContent: "center",
                    alignSelf: "center"
                }
            }
        />
        <s.SpacerMedium/>


        { /* Row of boogers */ } 
        <s.Container
            flex = { 5 }
            fd = { "row" }
            jc = { "center" }
        > 
            <StyledImg
                alt = { "Dark Booger" }
                src = { "/config/images/booger_belly_assets/boogers/BoogerBelly_01.png" }
                style = {
                    { 
                        backgroundColor: "#FFCF83",
                        justifyContent: "center",
                        alignSelf: "center" 
                    }
                }
            /> 
            <StyledImg
                alt = { "dark booger" }
                src = { "/config/images/booger_belly_assets/boogers/BoogerBelly_02.png" }
                style = {
                    { 
                        backgroundColor: "#FFCF83",
                        justifyContent: "center",
                        alignSelf: "center"
                    }
                }
            /> 
            <StyledImg
                alt = { "Dark Booger" }
                src = { "/config/images/booger_belly_assets/boogers/BoogerBelly_03.png" }
                style = {
                    { backgroundColor: "#FFCF83", justifyContent: "center", alignSelf: "center" }
                }
            /> 
            <StyledImg
                alt = { "Dark Booger" }
                src = { "/config/images/booger_belly_assets/boogers/BoogerBelly_04.png" }
                style = {
                    { backgroundColor: "#FFCF83", justifyContent: "center", alignSelf: "center" }
                }
            /> 
            <StyledImg
                alt = { "Dark Booger" }
                src = { "/config/images/booger_belly_assets/boogers/BoogerBelly_05.png" }
                style = {
                    { backgroundColor: "#FFCF83", justifyContent: "center", alignSelf: "center" }
                }
            /> 
    </s.Container>

    </ResponsiveWrapper> 
        <s.SpacerMedium / >
        <s.Container
            jc = { "center" }
            ai = { "center" }
            style = {
                { 
                    width: "70%"
                }
            }
        >
    <s.TextDescription
        style = {
            {
                textAlign: "center",
                color: "var(--primary-text)",
            }
        }
    >
        We have set the gas limit to { CONFIG.GAS_LIMIT }
        for the contract to successfully mint your NFT.We recommend that you don 't lower the
        gas limit.
    </s.TextDescription>
    </s.Container >
    </s.Container>

    </s.Screen>
);
}


export default App;



// Code to provide link to contract address 
/* 
            <s.TextDescription
              style={{
                textAlign: "center",
                color: "var(--primary-text)",
              }}
            >
              <StyledLink target={"_blank"} href={CONFIG.SCAN_LINK}>
                {truncate(CONFIG.CONTRACT_ADDRESS, 15)}
              </StyledLink>
            </s.TextDescription>
 */