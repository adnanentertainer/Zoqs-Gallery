import { Input } from "@/components/ui/Input";
import { PAKISTAN_PROVINCES } from "@/constants/pakistan";
import type { ShippingAddress } from "@/types/order";

export type ShippingFieldErrors = Partial<
  Record<keyof ShippingAddress, string>
>;

interface ShippingAddressFormProps {
  values: ShippingAddress;
  errors: ShippingFieldErrors;
  onChange: (field: keyof ShippingAddress, value: string) => void;
}

const selectStyles =
  "h-11 w-full rounded-sm border border-beige bg-white px-4 font-body text-sm text-primary focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold disabled:cursor-not-allowed disabled:opacity-50";

export function ShippingAddressForm({
  values,
  errors,
  onChange,
}: ShippingAddressFormProps) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Input
        label="Full Name"
        name="fullName"
        autoComplete="name"
        required
        value={values.fullName}
        onChange={(event) => onChange("fullName", event.target.value)}
        error={errors.fullName}
        className="sm:col-span-2"
      />
      <Input
        label="Email"
        type="email"
        name="email"
        autoComplete="email"
        required
        value={values.email}
        onChange={(event) => onChange("email", event.target.value)}
        error={errors.email}
      />
      <Input
        label="Phone"
        type="tel"
        name="phone"
        autoComplete="tel"
        placeholder="03XXXXXXXXX"
        required
        value={values.phone}
        onChange={(event) => onChange("phone", event.target.value)}
        error={errors.phone}
      />
      <Input
        label="Address Line 1"
        name="addressLine1"
        autoComplete="address-line1"
        required
        value={values.addressLine1}
        onChange={(event) => onChange("addressLine1", event.target.value)}
        error={errors.addressLine1}
        className="sm:col-span-2"
      />
      <Input
        label="Address Line 2 (optional)"
        name="addressLine2"
        autoComplete="address-line2"
        value={values.addressLine2}
        onChange={(event) => onChange("addressLine2", event.target.value)}
        error={errors.addressLine2}
        className="sm:col-span-2"
      />
      <Input
        label="City"
        name="city"
        autoComplete="address-level2"
        required
        value={values.city}
        onChange={(event) => onChange("city", event.target.value)}
        error={errors.city}
      />
      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="province"
          className="font-body text-sm font-medium text-primary"
        >
          Province
        </label>
        <select
          id="province"
          name="province"
          required
          value={values.province}
          onChange={(event) => onChange("province", event.target.value)}
          aria-invalid={!!errors.province || undefined}
          aria-describedby={errors.province ? "province-error" : undefined}
          className={selectStyles}
        >
          <option value="" disabled>
            Select a province
          </option>
          {PAKISTAN_PROVINCES.map((province) => (
            <option key={province} value={province}>
              {province}
            </option>
          ))}
        </select>
        {errors.province && (
          <p id="province-error" className="font-body text-xs text-error">
            {errors.province}
          </p>
        )}
      </div>
      <Input
        label="Postal Code"
        name="postalCode"
        autoComplete="postal-code"
        required
        value={values.postalCode}
        onChange={(event) => onChange("postalCode", event.target.value)}
        error={errors.postalCode}
      />
      <Input
        label="Country"
        name="country"
        value={values.country}
        disabled
        readOnly
      />
    </div>
  );
}
