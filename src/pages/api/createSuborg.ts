import type { NextApiRequest, NextApiResponse } from "next";
import { Turnkey, TurnkeyApiTypes } from "@turnkey/sdk-server";
import { refineNonNull } from "@/utils";
import { TWalletDetails } from "@/types";

// Default path for the first Ethereum address in a new HD wallet.
// See https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki, paths are in the form:
//     m / purpose' / coin_type' / account' / change / address_index
// - Purpose is a constant set to 44' following the BIP43 recommendation.
// - Coin type is set to 60 (ETH) -- see https://github.com/satoshilabs/slips/blob/master/slip-0044.md
// - Account, Change, and Address Index are set to 0
import { DEFAULT_ETHEREUM_ACCOUNTS } from "@turnkey/sdk-server";

type TAttestation = TurnkeyApiTypes["v1Attestation"];

type CreateSubOrgWithWalletRequest = {
  subOrgName: string;
  userName: string
  challenge: string;
  attestation: TAttestation;
};

type ErrorMessage = {
  message: string;
};

export default async function createUser(
  req: NextApiRequest,
  res: NextApiResponse<TWalletDetails | ErrorMessage>
) {
  const createSubOrgRequest = req.body as CreateSubOrgWithWalletRequest;

  try {
    const turnkey = new Turnkey({
      apiBaseUrl: process.env.NEXT_PUBLIC_TURNKEY_API_BASE_URL!,
      apiPrivateKey: process.env.TURNKEY_API_PRIVATE_KEY!,
      apiPublicKey: process.env.TURNKEY_API_PUBLIC_KEY!,
      defaultOrganizationId: process.env.NEXT_PUBLIC_ORGANIZATION_ID!,
    });

    const apiClient = turnkey.api(); // TODO: rename to apiClient

    const walletName = `Default FuseGo Wallet`;

    const createSubOrgResponse = await apiClient.createSubOrganization({
      subOrganizationName: createSubOrgRequest.subOrgName,
      rootQuorumThreshold: 1,
      rootUsers: [
        {
          userName: createSubOrgRequest.userName,
          apiKeys: [],
          authenticators: [
            {
              authenticatorName: "Passkey",
              challenge: createSubOrgRequest.challenge,
              attestation: createSubOrgRequest.attestation,
            },
          ],
        },
      ],
      wallet: {
        walletName: walletName,
        accounts: DEFAULT_ETHEREUM_ACCOUNTS,
      },
    });

    const subOrgId = refineNonNull(createSubOrgResponse.subOrganizationId);
    const wallet = refineNonNull(createSubOrgResponse.wallet);

    const walletId = wallet.walletId;
    const walletAddress = wallet.addresses[0];

    res.status(200).json({
      id: walletId,
      address: walletAddress,
      subOrgId: subOrgId,
    });
  } catch (e) {
    console.error(e);

    res.status(500).json({
      message: "Something went wrong.",
    });
  }
}
