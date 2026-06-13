import { recalculateAccountBalances } from "@/actions/accounts";

export async function POST(request) {
  try {
    const result = await recalculateAccountBalances();
    return Response.json(result);
  } catch (error) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
