import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ethers, BigNumber } from 'ethers';
import tokenJson from '../../assets/MyToken.json';
// import ballotJson

// const ERC20VOTES_TOKEN_ADDRESS = '0x324c938062235e86dBF068AC2ede9211fE5f842f';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit {
  wallet: ethers.Wallet | undefined;
  provider: ethers.providers.BaseProvider | undefined;

  tokenContractAddress: string | undefined;
  // ballotContractAddress
  // ballotContractInstance connected to the wallet

  tokenContract: ethers.Contract | undefined;
  etherBalance: number | string;
  tokenBalance: number | string;
  votePower: number | string;

  constructor(private http: HttpClient) {
    this.etherBalance = 'pending...';
    this.tokenBalance = 'pending...';
    this.votePower = 'pending...';
  }
  
  createWallet() {
    this.provider = ethers.providers.getDefaultProvider('goerli');
    this.wallet = ethers.Wallet.createRandom().connect(this.provider);
    this.http
      .get<{ result: string }>('http://localhost:3000/token-address')
      .subscribe(({result}) => {
        this.tokenContractAddress = result;
        this.updateBlockChainInfo();
        setInterval(this.updateBlockChainInfo, 1000); // update blockchain every 1 second
      });
  }
  private updateBlockChainInfo() {
    if (this.tokenContractAddress && this.wallet) {
      this.tokenContract = new ethers.Contract(
        this.tokenContractAddress,
        tokenJson.abi,
        this.wallet
      );
      // this.tokenContract.on("Transfer") // TODO some kind of event emitter when transfers happen on contract??
      this.wallet.getBalance().then((balanceBn) => {
        this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBn));
      });

      this.tokenContract['balanceOf'](this.wallet.address).then(
        (tokenBalanceBn: BigNumber) => {
          this.tokenBalance = parseFloat(
            ethers.utils.formatEther(tokenBalanceBn)
          );
          console.log(`This fucking thing!!!:::Lclkn${this.tokenBalance}`);
        }
      );

      this.tokenContract['getVotes'](this.wallet.address).then(
        (votePowerBn: BigNumber) => {
          this.votePower = parseFloat(
            ethers.utils.formatEther(votePowerBn)
          );
        }
      );
    }
  }

  vote(voteId: string) {
    // TODO: this.ballotContract['vote'](voteId) **import ballotJson 
  }

  request() {
    const reqBody = {address: this.wallet?.address}
    this.http
      .post<{ result: boolean }>('http://localhost:3000/request-tokens', reqBody, )
      .subscribe(({result}) => {
        console.log({result})
      })
  }

  ngOnInit(): void {}
}
