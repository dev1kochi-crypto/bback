import { getCustomerAddresses } from '@/lib/api';
import { addressToCheckoutForm, clearCheckoutDraft, readCheckoutDraft, writeCheckoutDraft } from '@/lib/checkoutStorage';

export async function resolveCheckoutHref(token: string | null): Promise<string> {
  if (!token) {
    clearCheckoutDraft();

    return '/checkout';
  }

  try {
    const { addresses } = await getCustomerAddresses(token);

    if (!addresses.length) {
      return '/checkout';
    }

    const existingDraft = readCheckoutDraft();

    if (!existingDraft?.form.address_line_1?.trim()) {
      const defaultAddress = addresses.find((address) => address.is_default) ?? addresses[0];

      writeCheckoutDraft({
        form: {
          ...addressToCheckoutForm(defaultAddress),
          notes: existingDraft?.form.notes ?? '',
        },
        selectedAddressId: defaultAddress.id,
        isAddingAddress: false,
      });
    }

    return '/checkout/review';
  } catch {
    return '/checkout';
  }
}
