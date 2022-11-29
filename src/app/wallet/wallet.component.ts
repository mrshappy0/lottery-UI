import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ethers, BigNumber } from 'ethers';
import tokenJson from '../../assets/LotteryToken.json';
import lotteryJson from '../../assets/Lottery.json';

const BET_PRICE = 1;
const BET_FEE = 0.2;
const TOKEN_RATIO = 1;

interface TransactionReceipt {
  transactionIndex: number;
  transactionHash: string;
}

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
  receipts: TransactionReceipt[];
  walletBalance: number | string;
  errors: Error[];
  prize: string;
  ownerPoolBalance: string;

  constructor(private http: HttpClient) {
    this.etherBalance = 'pending...';
    this.tokenBalance = 'pending...';
    this.votePower = 'pending...';
    this.walletBalance = 'pending...';
    this.lotteryState = 'pending...';
    this.receipts = [];
    this.errors = [];
    this.prize = 'pending...';
    this.ownerPoolBalance = '0';
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

  createTxReceiptLog = ({ transactionIndex, transactionHash }: any) => {
    return { transactionIndex, transactionHash };
  };

  async checkState() {
    if (this.lotteryContract) {
      this.lotteryState = (await this.lotteryContract['betsOpen']) // TODO: display in UI
        ? 'open'
        : 'closed';
      console.log(`The lottery is ${this.lotteryState}\n`);
    }
  }

  async openBets(duration: string) {
    if (this.provider && this.lotteryContract) {
      const currentBlock = await this.provider.getBlock('latest');
      const tx = await this.lotteryContract['openBets'](
        currentBlock.timestamp + Number(duration)
      );
      const TxReceiptLog = this.createTxReceiptLog(await tx.wait());
      this.receipts.push(TxReceiptLog); // TODO: display in UI
      console.log(`Bets opened (${JSON.stringify(TxReceiptLog)})`);
    }
  }

  async displayBalance() {
    if (this.provider && this.wallet) {
      const balanceBN = await this.provider.getBalance(this.wallet.address);
      this.walletBalance = ethers.utils.formatEther(balanceBN);
      console.log(
        `The account of address ${this.wallet.address} has ${this.walletBalance} ETH\n`
      );
    }
  }

  async buyTokens(amount: string) {
    if (this.provider && this.lotteryContract && this.wallet) {
      const tx = await this.lotteryContract
        .connect(this.wallet)
        ['purchaseTokens']({
          value: ethers.utils.parseEther(amount).div(TOKEN_RATIO),
        });
      const txReceiptLog = this.createTxReceiptLog(await tx.wait());
      this.receipts.push(txReceiptLog);
      console.log(`Tokens bought (${txReceiptLog})\n`);
    }
  }

  async displayTokenBalance() {
    if (!this.tokenContract)
      this.errors.push(
        new Error('displayTokenBalance: Token Contract not initialized')
      );

    if (!this.wallet)
      this.errors.push(new Error('displayTokenBalance: No Wallet exists!'));

    if (this.wallet && this.tokenContract) {
      const balanceBN = await this.tokenContract['balanceOf'](
        this.wallet.address
      );
      this.tokenBalance = ethers.utils.formatEther(balanceBN);
      console.log(
        `The account of address ${this.wallet.address} has ${this.tokenBalance} LT0\n`
      );
    }
  }

  async bet(amount: string) {
    if (!this.tokenContract)
      this.errors.push(new Error('bet: Token Contract not initialized'));
    if (!this.lotteryContract)
      this.errors.push(new Error('bet: Lottery Contract not initialized!'));
    if (!this.wallet) this.errors.push(new Error('bet: No Wallet exists!'));

    if (this.wallet && this.tokenContract && this.lotteryContract) {
      const allowTx = await this.tokenContract
        .connect(this.wallet)
        ['approve'](this.lotteryContractAddress, ethers.constants.MaxUint256);
      await allowTx.wait();
      const tx = await this.lotteryContract
        .connect(this.wallet)
        ['betMany'](amount);
      const txReceiptLog = this.createTxReceiptLog(await tx.wait());
      this.receipts.push(txReceiptLog);
      console.log(`Bets placed (${txReceiptLog})\n`);
    }
  }

  async closeLottery() {
    if (!this.tokenContract)
      this.errors.push(
        new Error('closeLottery: Token Contract not initialized')
      );
    if (!this.lotteryContract)
      this.errors.push(
        new Error('closeLottery: Lottery Contract not initialized!')
      );
    if (this.tokenContract && this.lotteryContract) {
      const tx = await this.lotteryContract['closeLottery']();
      const txReceiptLog = this.createTxReceiptLog(await tx.wait());
      this.receipts.push(txReceiptLog);
      console.log(`Bets closed (${txReceiptLog})\n`);
    }
  }

  async displayPrize() {
    if (!this.lotteryContract)
      this.errors.push(
        new Error('displayPrize: Lottery Contract not initialized!')
      );
    if (!this.wallet)
      this.errors.push(new Error('displayPrize: No Wallet exists!'));
    if (this.wallet && this.lotteryContract) {
      const prizeBN = await this.lotteryContract['prize'](this.wallet.address);
      this.prize = ethers.utils.formatEther(prizeBN);
      console.log(
        `The account of address ${this.wallet.address} has earned a prize of ${this.prize} Tokens\n`
      );
    }
  }

  async claimPrize(amount: string) {
    if (!this.lotteryContract)
      this.errors.push(
        new Error('claimPrize: Lottery Contract not initialized!')
      );
    if (!this.wallet)
      this.errors.push(new Error('claimPrize: No Wallet exists!'));
    if (this.wallet && this.lotteryContract) {
      const tx = await this.lotteryContract
        .connect(this.wallet)
        ['prizeWithdraw'](ethers.utils.parseEther(amount));
      const txReceiptLog = this.createTxReceiptLog(await tx.wait());
      this.receipts.push(txReceiptLog);
      console.log(`Prize claimed (${txReceiptLog})\n`);
    }
  }

  async displayOwnerPool() {
    if (!this.lotteryContract)
      this.errors.push(
        new Error('displayOwnerPool: Lottery Contract not initialized!')
      );
    if (this.lotteryContract) {
      const balanceBN = await this.lotteryContract['ownerPool']();
      this.ownerPoolBalance = ethers.utils.formatEther(balanceBN);
      console.log(`The owner pool has (${this.ownerPoolBalance}) Tokens \n`);
    }
  }

  async withdrawTokens(amount: string) {
    if (!this.lotteryContract)
      this.errors.push(
        new Error('withdrawTokens: Lottery Contract not initialized!')
      );
    if (this.lotteryContract) {
      const tx = await this.lotteryContract['ownerWithdraw'](
        ethers.utils.parseEther(amount)
      );
      const txReceiptLog = this.createTxReceiptLog(await tx.wait());
      this.receipts.push(txReceiptLog);
      console.log(`Withdraw confirmed (${txReceiptLog})\n`);
    }
  }

  async burnTokens(amount: string) {
    if (!this.tokenContract)
      this.errors.push(new Error('bet: Token Contract not initialized'));
    if (!this.lotteryContract)
      this.errors.push(new Error('bet: Lottery Contract not initialized!'));
    if (!this.wallet) this.errors.push(new Error('bet: No Wallet exists!'));

    if (this.wallet && this.tokenContract && this.lotteryContract) {
      const allowTx = await this.tokenContract
        .connect(this.wallet)
        ['approve'](this.lotteryContractAddress, ethers.constants.MaxUint256);
      const allowTxReceiptLog = this.createTxReceiptLog(await allowTx.wait());
      this.receipts.push(allowTxReceiptLog);
      console.log(`Allowance confirmed (${allowTxReceiptLog})\n`);
      const returnTx = await this.lotteryContract
        .connect(this.wallet)
        ['returnTokens'](ethers.utils.parseEther(amount));
      // const receipt = await returnTx.wait();
      const returnTxReceiptLog = this.createTxReceiptLog(await returnTx.wait());
      this.receipts.push(returnTxReceiptLog);
      console.log(`Burn confirmed (${returnTxReceiptLog})\n`);
    }
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
