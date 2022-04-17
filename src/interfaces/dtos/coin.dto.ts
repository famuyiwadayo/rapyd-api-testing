import { CoinSocialLinks, CoinListing, CoinStatus } from "../../entities";

export class createCoinDto {
  name: string;
  slug?: string;
  category: string;
  description?: string;
  website?: string;
  pictures?: string[];
  logo: string;
  type?: CoinListing;
  socialLinks?: Partial<CoinSocialLinks>;
}

export class changeCoinStatusDto {
  status: CoinStatus;
  type: CoinListing;
}

export class createCoinCategoryDto {
  name: string;
}

export type updateCoinDto = Partial<createCoinDto>;
export type updateCoinCategoryDto = Partial<createCoinCategoryDto>;
