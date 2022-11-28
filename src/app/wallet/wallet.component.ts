import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ethers, BigNumber } from 'ethers';
import tokenJson from '../../assets/LotteryToken.json';
import lotteryJson from '../../assets/Lottery.json';

@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
})
export class WalletComponent implements OnInit {
  wallet: ethers.Wallet | undefined;
  provider: ethers.providers.BaseProvider | undefined;
  tokenContractAddress: string | undefined;
  lotteryContractAddress: string | undefined;
  tokenContract: ethers.Contract | undefined;
  lotteryContract: ethers.Contract | undefined;
  etherBalance: number | string;
  tokenBalance: number | string;
  votePower: number | string;
  lotteryState: string;
  receiptTxHash: string;

  constructor(private http: HttpClient) {
    this.etherBalance = 'pending...';
    this.tokenBalance = 'pending...';
    this.votePower = 'pending...';
    this.lotteryState = 'pending...';
    this.receiptTxHash = 'pending...'
  }

  importWallet(private_key: string) {
    this.provider = new ethers.providers.AlchemyProvider('goerli', 'api-key');
    this.wallet = ethers.Wallet.fromMnemonic(private_key).connect(
      this.provider
    );
    this.getTokenAddress();
  }

  createWallet() {
    this.provider = new ethers.providers.AlchemyProvider('goerli', 'api-key');
    this.wallet = ethers.Wallet.createRandom().connect(this.provider);
    this.getTokenAddress();
  }

  private getTokenAddress() {
    this.http
      .get<{ result: any }>('http://localhost:3000/token-addresses')
      .subscribe(({ result }) => {
        this.tokenContractAddress = result.tokenAddr;
        this.lotteryContractAddress = result.tokenizedBallotAddr;
        this.updateBlockChainInfo();
        setInterval(this.updateBlockChainInfo, 1000);
      });
  }

  private updateBlockChainInfo() {
    if (
      this.tokenContractAddress &&
      this.wallet &&
      this.lotteryContractAddress
    ) {
      this.lotteryContract = new ethers.Contract(
        this.lotteryContractAddress,
        lotteryJson.abi,
        this.wallet
      );

      this.tokenContract = new ethers.Contract(
        this.tokenContractAddress,
        tokenJson.abi,
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

  async checkState() {
    if (this.lotteryContract) {
      this.lotteryState = (await this.lotteryContract['betsOpen']) // TODO: display in UI
        ? 'open'
        : 'closed';
      console.log(`The lottery is ${this.lotteryState}\n`);
    }
  }

  async openBets(duration: string) {
    if(this.provider && this.lotteryContract){
      const currentBlock = await this.provider.getBlock("latest");
      const tx = await this.lotteryContract['openBets'](currentBlock.timestamp + Number(duration));
      const receipt = await tx.wait();
      this.receiptTxHash = receipt.transactionHash; // TODO: display in UI
      console.log(`Bets opened (${this.receiptTxHash})`);
    }
  }

  async displayBalance(index: string) {
    const balanceBN = await ethers.provider.getBalance(
      accounts[Number(index)].address
    );
    const balance = ethers.utils.formatEther(balanceBN);
    console.log(
      `The account of address ${
        accounts[Number(index)].address
      } has ${balance} ETH\n`
    );
  }

  async buyTokens(index: string, amount: string) {
    //   const tx = await contract.connect(accounts[Number(index)]).purchaseTokens({
    //     value: ethers.utils.parseEther(amount).div(TOKEN_RATIO),
    //   });
    //   const receipt = await tx.wait();
    //   console.log(`Tokens bought (${receipt.transactionHash})\n`);
  }

  async displayTokenBalance(index: string) {
    // const balanceBN = await token.balanceOf(accounts[Number(index)].address);
    // const balance = ethers.utils.formatEther(balanceBN);
    // console.log(
    //   `The account of address ${
    //     accounts[Number(index)].address
    //   } has ${balance} LT0\n`
    // );
  }

  async bet(index: string, amount: string) {
    //   const allowTx = await token
    //   .connect(accounts[Number(index)])
    //   .approve(contract.address, ethers.constants.MaxUint256);
    // await allowTx.wait();
    // const tx = await contract.connect(accounts[Number(index)]).betMany(amount);
    // const receipt = await tx.wait();
    // console.log(`Bets placed (${receipt.transactionHash})\n`);
  }

  async closeLottery() {
    // const tx = await contract.closeLottery();
    // const receipt = await tx.wait();
    // console.log(`Bets closed (${receipt.transactionHash})\n`);
  }

  async displayPrize(index: string) {
    // const prizeBN = await contract.prize(accounts[Number(index)].address);
    // const prize = ethers.utils.formatEther(prizeBN);
    // console.log(
    //   `The account of address ${
    //     accounts[Number(index)].address
    //   } has earned a prize of ${prize} Tokens\n`
    // );
    // return prize;
  }

  async claimPrize(index: string, amount: string) {
    //   const tx = await contract
    //   .connect(accounts[Number(index)])
    //   .prizeWithdraw(ethers.utils.parseEther(amount));
    // const receipt = await tx.wait();
    // console.log(`Prize claimed (${receipt.transactionHash})\n`);
  }

  async displayOwnerPool() {
    // const balanceBN = await contract.ownerPool();
    // const balance = ethers.utils.formatEther(balanceBN);
    // console.log(`The owner pool has (${balance}) Tokens \n`);
  }

  async withdrawTokens(amount: string) {
    // const tx = await contract.ownerWithdraw(ethers.utils.parseEther(amount));
    // const receipt = await tx.wait();
    // console.log(`Withdraw confirmed (${receipt.transactionHash})\n`);
  }

  async burnTokens(index: string, amount: string) {
    //   const allowTx = await token
    //   .connect(accounts[Number(index)])
    //   .approve(contract.address, ethers.constants.MaxUint256);
    // const receiptAllow = await allowTx.wait();
    // console.log(`Allowance confirmed (${receiptAllow.transactionHash})\n`);
    // const tx = await contract
    //   .connect(accounts[Number(index)])
    //   .returnTokens(ethers.utils.parseEther(amount));
    // const receipt = await tx.wait();
    // console.log(`Burn confirmed (${receipt.transactionHash})\n`);
  }

  // vote(voteId: string, votePower: string) {
  //   const voteIdNum = typeof voteId == 'string' ? parseInt(voteId) : voteId;
  //   const votePowerNum =
  //     typeof votePower == 'string' ? parseInt(votePower) : votePower;

  //   if (this.lotteryContract) {
  //     this.lotteryContract['vote'](voteIdNum, votePowerNum).then(() => {
  //       console.log(`Vote Successfully Cast!!`);
  //     });
  //   }
  // }

  // async delegate() {
  //   if (this.tokenContract && this.wallet) {
  //     this.tokenContract['delegate'](this.wallet.address).then(() => {
  //       this.votePower = this.tokenContract!['getVotes'](this.wallet!.address);
  //     });
  //   }
  // }

  // requestTokens(tokens: string) {
  //   const reqBody = {
  //     address: this.wallet?.address,
  //     tokens: ethers.utils.parseEther(tokens),
  //   };
  //   this.http
  //     .post<{ result: any }>('http://localhost:3000/request-tokens', reqBody)
  //     .subscribe(({ result }) => (this.tokenBalance = result));
  // }

  ngOnInit(): void {}
}
