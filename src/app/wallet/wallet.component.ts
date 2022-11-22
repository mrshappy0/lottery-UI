import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ethers, BigNumber } from 'ethers';
import tokenJson from '../../assets/MyToken.json';
import ballotJson from '../../assets/TokenizedBallot.json';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit {
  wallet: ethers.Wallet | undefined;
  provider: ethers.providers.BaseProvider | undefined;
  tokenContractAddress: string | undefined;
  ballotContractAddress: string | undefined;
  tokenContract: ethers.Contract | undefined;
  tokenizedBallotContract: ethers.Contract | undefined;
  etherBalance: number | string;
  tokenBalance: number | string;
  votePower: number | string;

  constructor(private http: HttpClient) {
    this.etherBalance = 'pending...';
    this.tokenBalance = 'pending...';
    this.votePower = 'pending...';
  }

  importWallet(private_key: string) {
    this.provider = new ethers.providers.AlchemyProvider(
      'goerli',
      'api-key'
    );
    this.wallet = ethers.Wallet.fromMnemonic(private_key).connect(
      this.provider
    );
    this.getTokenAddress();
  }

  createWallet() {
    this.provider = new ethers.providers.AlchemyProvider(
      'goerli',
      'api-key'
    );
    this.wallet = ethers.Wallet.createRandom().connect(this.provider);
    this.getTokenAddress();
  }

  private getTokenAddress() {
    this.http
      .get<{ result: any }>('http://localhost:3000/token-addresses')
      .subscribe(({ result }) => {
        this.tokenContractAddress = result.tokenAddr;
        this.ballotContractAddress = result.tokenizedBallotAddr;
        this.updateBlockChainInfo();
        setInterval(this.updateBlockChainInfo, 1000);
      });
  }

  private updateBlockChainInfo() {
    if (
      this.tokenContractAddress &&
      this.wallet &&
      this.ballotContractAddress
    ) {
      this.tokenContract = new ethers.Contract(
        this.tokenContractAddress,
        tokenJson.abi,
        this.wallet
      );
      this.tokenizedBallotContract = new ethers.Contract(
        this.ballotContractAddress,
        ballotJson.abi,
        this.wallet
      );
      this.wallet.getBalance().then((balanceBn) => {
        this.etherBalance = parseFloat(ethers.utils.formatEther(balanceBn));
      });

      this.tokenContract['balanceOf'](this.wallet.address).then(
        (tokenBalanceBn: BigNumber) => {
          this.tokenBalance = parseFloat(
            ethers.utils.formatEther(tokenBalanceBn)
          );
        }
      );

      this.tokenContract['getVotes'](this.wallet.address).then(
        (votePowerBn: BigNumber) => {
          this.votePower = parseFloat(ethers.utils.formatEther(votePowerBn));
        }
      );
    }
  }

  vote(voteId: string, votePower: string) {
    const voteIdNum = typeof voteId == 'string' ? parseInt(voteId) : voteId;
    const votePowerNum =
      typeof votePower == 'string' ? parseInt(votePower) : votePower;

    console.log(`voteIdNum: ${voteIdNum} and typeof: ${typeof voteIdNum}`)
    console.log(`voteIdNum: ${votePowerNum} and typeof: ${typeof votePowerNum}`)
    if (this.tokenizedBallotContract) {
      console.log("thing 1oifjd", this.tokenizedBallotContract['vote'])
      this.tokenizedBallotContract['vote'](voteIdNum, votePowerNum).then(() => {
        console.log(`Vote Successfully Cast!!`);
      });
    }
  }

  async delegate() {
    if (this.tokenContract && this.wallet) {
      this.tokenContract['delegate'](this.wallet.address).then(() => {
        this.votePower = this.tokenContract!['getVotes'](this.wallet!.address);
      });
    }
  }

  requestTokens(tokens: string) {
    const reqBody = {
      address: this.wallet?.address,
      tokens: ethers.utils.parseEther(tokens),
    };
    this.http
      .post<{ result: any }>('http://localhost:3000/request-tokens', reqBody)
      .subscribe(({ result }) => (this.tokenBalance = result));
  }

  ngOnInit(): void {}
}
