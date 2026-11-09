"use client";

import {
  createCarModel,
  createCarVariant,
  createVehicle,
  deleteVehicleImage,
  saveCityPrice,
  saveVehicleImage,
  updateCarModel,
  updateCarVariant,
  createShowroom,
  updateShowroom,
  createConsultant,
  updateConsultant,
  createCity,
  updateCity,
  updateVehicle,
  updateVehicleStatus,
} from "@/app/actions/admin";
import { displayAvailability, displayFuel, formatPrice } from "../lib/format";
import { Card, Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/primitives";
import { InfoNotice } from "./ui";
import AdminActionForm from "./admin-action-form";

const fieldClass = "form-input";
const gridClass = "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";
const labelClass = "form-label";

export default function AdminTabs({ inventory, models, variants, newVariants, cities, prices, showrooms, consultants }) {
  return (
    <Tabs defaultValue="inventory">
      <TabsList className="mb-5 overflow-x-auto bg-white px-2">
        <TabsTrigger value="inventory">Inventory</TabsTrigger>
        <TabsTrigger value="models">Models & variants</TabsTrigger>
        <TabsTrigger value="pricing">City pricing</TabsTrigger>
        <TabsTrigger value="showrooms">Showrooms</TabsTrigger>
        <TabsTrigger value="consultants">Consultants</TabsTrigger>
      </TabsList>

      <TabsContent value="inventory" className="space-y-5">
        <Card className="p-5 sm:p-7">
          <h2 className="text-xl font-medium">Add vehicle</h2>
          <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
            New-car prices are ex-showroom. Used-car prices are listing prices. Previous-owner and inspection fields are optional.
          </p>
          <AdminActionForm action={createVehicle} className="mt-5">
            <VehicleFields variants={variants} showrooms={showrooms} />
          </AdminActionForm>
        </Card>

        <div className="grid gap-5">
          {inventory.map((vehicle) => (
            <Card key={vehicle.stockId} className="p-5 sm:p-7">
              <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--accent)]">{vehicle.stockId}</p>
                  <h3 className="mt-2 text-lg font-medium">{vehicle.variant.model.name} · {vehicle.variant.name}</h3>
                  <p className="mt-1 text-xs text-[var(--muted)]">
                    {vehicle.isDemo ? "Demo car — not public sales inventory" : "Inventory record"}
                  </p>
                </div>
                <span className="text-xs text-[var(--muted)]">{displayAvailability(vehicle.status)}</span>
              </div>
              {!vehicle.isDemo && (
                <AdminActionForm action={updateVehicle}>
                  <input type="hidden" name="stockId" value={vehicle.stockId} />
                  <VehicleFields
                    variants={variants}
                    showrooms={showrooms}
                    vehicle={vehicle}
                  />
                </AdminActionForm>
              )}
              {vehicle.isDemo && (
                <p className="text-xs text-[var(--muted)]">Demo-car details remain reserved for the test-drive sample flow.</p>
              )}

              <AdminActionForm
                action={updateVehicleStatus}
                className="mt-5 flex flex-wrap items-end gap-3 border-t border-[var(--line)] pt-5"
                submitLabel="Update availability"
              >
                <input type="hidden" name="stockId" value={vehicle.stockId} />
                <label className={labelClass}>
                  Availability
                  <select className={fieldClass} name="status" defaultValue={vehicle.status}>
                    {vehicle.stockId === "UC-1190" ? (
                      <option value="BOOKED">Booked (required)</option>
                    ) : (
                      <>
                        <option value="AVAILABLE">Available</option>
                        <option value="BOOKED">Booked</option>
                        <option value="SOLD">Sold</option>
                      </>
                    )}
                  </select>
                </label>
              </AdminActionForm>

              {!vehicle.isDemo && (
                <VehicleImages vehicle={vehicle} />
              )}
            </Card>
          ))}
          {inventory.length === 0 && <EmptyState text="No inventory records yet. Add the first vehicle above." />}
        </div>
      </TabsContent>

      <TabsContent value="models" className="space-y-5">
        <div className={gridClass}>
          <Card className="p-5">
            <h2 className="font-medium">Add model</h2>
            <AdminActionForm action={createCarModel}>
              <div className="mt-4 grid gap-3">
                <Field label="Brand"><input className={fieldClass} name="brand" required maxLength="80" /></Field>
                <Field label="Model"><input className={fieldClass} name="name" required maxLength="100" /></Field>
              </div>
            </AdminActionForm>
          </Card>
          <Card className="p-5">
            <h2 className="font-medium">Add variant</h2>
            <AdminActionForm action={createCarVariant}>
              <div className="mt-4 grid gap-3">
                <Field label="Model">
                  <select className={fieldClass} name="modelId" required defaultValue="">
                    <option value="" disabled>Select a model</option>
                    {models.map((model) => <option key={model.id} value={model.id}>{model.brand} · {model.name}</option>)}
                  </select>
                </Field>
                <Field label="Variant"><input className={fieldClass} name="name" required maxLength="100" /></Field>
                <FuelSelect />
              </div>
            </AdminActionForm>
          </Card>
        </div>
        {models.map((model) => (
          <Card key={model.id} className="p-5 sm:p-7">
            <h3 className="mb-4 text-lg font-medium">{model.brand} · {model.name}</h3>
            <AdminActionForm action={updateCarModel} className="mb-6 border-b border-[var(--line)] pb-6">
              <input type="hidden" name="modelId" value={model.id} />
              <div className={gridClass}>
                <Field label="Brand"><input className={fieldClass} name="brand" defaultValue={model.brand} required /></Field>
                <Field label="Model"><input className={fieldClass} name="name" defaultValue={model.name} required /></Field>
              </div>
            </AdminActionForm>
            <div className="grid gap-4">
              {model.variants.map((variant) => (
                <AdminActionForm key={variant.id} action={updateCarVariant}>
                  <input type="hidden" name="variantId" value={variant.id} />
                  <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
                    <Field label="Variant"><input className={fieldClass} name="name" defaultValue={variant.name} required /></Field>
                    <FuelSelect defaultValue={variant.fuel} />
                    <p className="pb-3 text-xs text-[var(--muted)]">{variant._count.inventory} stock records</p>
                  </div>
                </AdminActionForm>
              ))}
            </div>
          </Card>
        ))}
      </TabsContent>

      <TabsContent value="pricing" className="space-y-5">
        <InfoNotice title="Demo prices are assumptions:">
          Amounts seeded for demonstration were not supplied or approved by Company A. Replace them with verified city and variant prices before presenting them as actual dealer pricing.
        </InfoNotice>
        <Card className="p-5 sm:p-7">
          <h2 className="text-xl font-medium">Add city</h2>
          <AdminActionForm action={createCity} className="mt-5">
            <CityFields />
          </AdminActionForm>
        </Card>
        {cities.map((city) => (
          <Card key={city.id} className="p-5">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Pricing city</p>
            <AdminActionForm action={updateCity}>
              <input type="hidden" name="cityId" value={city.id} />
              <CityFields city={city} />
            </AdminActionForm>
          </Card>
        ))}
        <Card className="p-5 sm:p-7">
          <h2 className="text-xl font-medium">Add city pricing</h2>
          <AdminActionForm action={saveCityPrice} className="mt-5">
            <CityPriceFields cities={cities} variants={newVariants} />
          </AdminActionForm>
        </Card>
        {prices.map((price) => (
          <Card key={price.id} className="p-5 sm:p-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="font-medium">{price.city.name}, {price.city.state} · {price.variant.model.name} {price.variant.name}</h3>
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {price.isAssumed ? "Assumed demonstration values — not official Company A prices" : "Admin-managed pricing"}
                </p>
              </div>
              <span className="text-sm font-medium">{formatPrice(price.exShowroomPriceInr)} ex-showroom</span>
            </div>
            <AdminActionForm action={saveCityPrice}>
              <input type="hidden" name="cityPriceId" value={price.id} />
              <CityPriceFields cities={cities} variants={newVariants} price={price} />
            </AdminActionForm>
          </Card>
        ))}
        {prices.length === 0 && <EmptyState text="No city price records exist yet. Add approved or clearly assumed demonstration charges above." />}
      </TabsContent>

      <TabsContent value="showrooms" className="space-y-5">
        <Card className="p-5 sm:p-7">
          <h2 className="text-xl font-medium">Add showroom</h2>
          <AdminActionForm action={createShowroom} className="mt-5">
            <div className={gridClass}>
              <Field label="Name"><input className={fieldClass} name="name" required maxLength="100" /></Field>
              <Field label="Address (optional)"><input className={fieldClass} name="address" maxLength="300" /></Field>
              <Field label="City">
                <select className={fieldClass} name="cityId" required defaultValue="">
                  <option value="" disabled>Select city</option>
                  {cities.map((city) => <option key={city.id} value={city.id}>{city.name}, {city.state}</option>)}
                </select>
              </Field>
            </div>
          </AdminActionForm>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {showrooms.map((showroom) => (
            <Card key={showroom.id} className="p-5">
              <p className="mb-3 text-xs text-[var(--muted)]">{showroom.city.name}{showroom.isAssumed ? " · assumed demo showroom" : ""}</p>
              <AdminActionForm action={updateShowroom}>
                <input type="hidden" name="showroomId" value={showroom.id} />
                <div className="grid gap-3">
                  <Field label="Name"><input className={fieldClass} name="name" defaultValue={showroom.name} required maxLength="100" /></Field>
                  <Field label="Address"><input className={fieldClass} name="address" defaultValue={showroom.address ?? ""} maxLength="300" /></Field>
                  <Field label="Status">
                    <select className={fieldClass} name="isActive" defaultValue={String(showroom.isActive)}>
                      <option value="true">Active</option><option value="false">Inactive</option>
                    </select>
                  </Field>
                </div>
              </AdminActionForm>
            </Card>
          ))}
          {showrooms.length === 0 && <EmptyState text="No showrooms are configured." />}
        </div>
      </TabsContent>

      <TabsContent value="consultants">
        <Card className="mb-5 p-5 sm:p-7">
          <h2 className="text-xl font-medium">Add consultant</h2>
          <p className="mt-2 text-xs text-[var(--muted)]">The password is hashed before it is stored. Share credentials securely.</p>
          <AdminActionForm action={createConsultant} className="mt-5">
            <div className={gridClass}>
              <Field label="Name"><input className={fieldClass} name="name" required maxLength="100" /></Field>
              <Field label="Email"><input className={fieldClass} name="email" type="email" required maxLength="254" /></Field>
              <Field label="Temporary password (12–72 bytes)"><input className={fieldClass} name="password" type="password" minLength="12" required /></Field>
              <Field label="Showroom">
                <select className={fieldClass} name="showroomId" required defaultValue="">
                  <option value="" disabled>Select showroom</option>
                  {showrooms.map((showroom) => <option key={showroom.id} value={showroom.id}>{showroom.name}</option>)}
                </select>
              </Field>
              <ModelSpecialties models={models} />
            </div>
          </AdminActionForm>
        </Card>
        <Card className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead><tr className="border-b border-[var(--line)] text-[var(--muted)]">
              <th className="px-4 py-3">Consultant</th><th className="px-4 py-3">Email</th><th className="px-4 py-3" colSpan="2">Assignment and eligible models</th>
            </tr></thead>
            <tbody>{consultants.map((consultant) => (
              <tr key={consultant.id} className="border-b border-[var(--line)] last:border-0">
                <td className="px-4 py-4">{consultant.user.name}</td>
                <td className="px-4 py-4">{consultant.user.email}</td>
                <td className="px-4 py-4" colSpan="2">
                  <AdminActionForm action={updateConsultant} className="flex min-w-[400px] items-end gap-2">
                    <input type="hidden" name="consultantId" value={consultant.id} />
                    <Field label="Showroom">
                      <select className={fieldClass} name="showroomId" defaultValue={consultant.showroomId}>
                        {showrooms.map((showroom) => <option key={showroom.id} value={showroom.id}>{showroom.name}</option>)}
                      </select>
                    </Field>
                    <Field label="Status">
                      <select className={fieldClass} name="isActive" defaultValue={String(consultant.isActive)}>
                        <option value="true">Active</option><option value="false">Inactive</option>
                      </select>
                    </Field>
                    <ModelSpecialties models={models} selected={consultant.models} />
                  </AdminActionForm>
                </td>
              </tr>
            ))}</tbody>
          </table>
        </Card>
      </TabsContent>
    </Tabs>
  );
}

function VehicleFields({ variants, showrooms, vehicle }) {
  const defaultType = vehicle?.type ?? "NEW";
  return (
    <div className={`${gridClass} ${vehicle ? "" : "mt-4"}`}>
      {!vehicle && <Field label="Stock ID"><input className={fieldClass} name="stockId" required maxLength="40" /></Field>}
      <Field label="Vehicle type">
        <select className={fieldClass} name="type" defaultValue={defaultType}>
          <option value="NEW">New</option><option value="USED">Used</option>
        </select>
      </Field>
      <Field label="Variant">
        <select className={fieldClass} name="variantId" defaultValue={vehicle?.variantId ?? ""} required>
          <option value="" disabled>Select variant</option>
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id}>
              {variant.model.name} · {variant.name} · {displayFuel(variant.fuel)}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Year"><input className={fieldClass} type="number" name="year" min="1900" max="2100" defaultValue={vehicle?.year ?? ""} required /></Field>
      <Field label="Kilometres"><input className={fieldClass} type="number" name="kilometres" min="0" defaultValue={vehicle?.kilometres ?? ""} required /></Field>
      <Field label="Price (₹)"><input className={fieldClass} type="number" name="priceInr" min="1" defaultValue={vehicle?.priceInr ?? ""} required /></Field>
      <Field label="Price basis">
        <select className={fieldClass} name="priceType" defaultValue={vehicle?.priceType ?? "EX_SHOWROOM"}>
          <option value="EX_SHOWROOM">Ex-showroom</option>
          <option value="LISTING_PRICE">Used-car listing price</option>
        </select>
      </Field>
      <Field label="Showroom">
        <select className={fieldClass} name="showroomId" defaultValue={vehicle?.showroomId ?? ""}>
          <option value="">Not assigned</option>
          {showrooms.map((showroom) => <option key={showroom.id} value={showroom.id}>{showroom.name}</option>)}
        </select>
      </Field>
      <Field label="Previous owners (used only; optional)">
        <input className={fieldClass} type="number" name="previousOwners" min="0" max="100" defaultValue={vehicle?.previousOwners ?? ""} />
      </Field>
      <Field label="Inspection report (used only; optional)">
        <textarea className={`${fieldClass} min-h-20 py-3`} name="inspectionReport" maxLength="5000" defaultValue={vehicle?.inspectionReport ?? ""} />
      </Field>
      <label className="flex items-center gap-2 text-xs text-[var(--ink)]">
        <input
          type="checkbox"
          name="detailsAreAssumed"
          value="true"
          defaultChecked={vehicle?.detailsAreAssumed ?? false}
        />
        Owner/inspection details are assumptions for demonstration
      </label>
      {vehicle?.detailsAreAssumed && (
        <p className="self-end pb-3 text-xs text-amber-800">Current owner/report values are assumptions. Save verified values to replace them.</p>
      )}
      {!vehicle && (
        <Field label="Initial availability">
          <select className={fieldClass} name="status" defaultValue="AVAILABLE">
            {vehicle?.stockId === "UC-1190" ? (
              <option value="BOOKED">Booked (required)</option>
            ) : (
              <>
                <option value="AVAILABLE">Available</option><option value="BOOKED">Booked</option><option value="SOLD">Sold</option>
              </>
            )}
          </select>
        </Field>
      )}
    </div>
  );
}

function CityPriceFields({ cities, variants, price }) {
  return (
    <div className={gridClass}>
      <Field label="City">
        <select className={fieldClass} name="cityId" defaultValue={price?.cityId ?? ""} required>
          <option value="" disabled>Select city</option>
          {cities.map((city) => <option key={city.id} value={city.id}>{city.name}, {city.state}</option>)}
        </select>
      </Field>
      <Field label="New-car variant">
        <select className={fieldClass} name="variantId" defaultValue={price?.variantId ?? ""} required>
          <option value="" disabled>Select variant</option>
          {variants.map((variant) => (
            <option key={variant.id} value={variant.id}>{variant.model.name} · {variant.name}</option>
          ))}
        </select>
      </Field>
      <Field label="Ex-showroom price (₹)">
        <input className={fieldClass} name="exShowroomPriceInr" type="number" min="1" defaultValue={price?.exShowroomPriceInr ?? ""} required />
      </Field>
      <Field label="Road tax (basis points)">
        <input
          className={fieldClass}
          name="roadTaxBasisPoints"
          type="number"
          min="0"
          max="10000"
          step="1"
          defaultValue={price?.roadTaxBasisPoints ?? ""}
          required
        />
        <span className="text-[10px] text-[var(--muted)]">Enter basis points: 800 = 8%.</span>
      </Field>
      <Field label="Registration fee (₹)">
        <input className={fieldClass} name="registrationFeeInr" type="number" min="0" defaultValue={price?.registrationFeeInr ?? ""} required />
      </Field>
      <Field label="Insurance (₹)">
        <input className={fieldClass} name="insuranceInr" type="number" min="0" defaultValue={price?.insuranceInr ?? ""} required />
      </Field>
      <Field label="Accessories (₹)">
        <input className={fieldClass} name="accessoriesInr" type="number" min="0" defaultValue={price?.accessoriesInr ?? ""} required />
      </Field>
      <Field label="Other charges (₹)">
        <input className={fieldClass} name="otherChargesInr" type="number" min="0" defaultValue={price?.otherChargesInr ?? 0} required />
      </Field>
      <Field label="Valid from">
        <input className={fieldClass} name="effectiveFrom" type="date" defaultValue={dateInputValue(price?.effectiveFrom)} required />
      </Field>
      <Field label="Valid through (optional)">
        <input className={fieldClass} name="effectiveUntil" type="date" defaultValue={dateInputValue(price?.effectiveUntil)} />
      </Field>
      <label className="flex items-center gap-2 text-xs text-[var(--ink)]">
        <input type="checkbox" name="isAssumed" value="true" defaultChecked={price?.isAssumed ?? false} />
        These are assumed demonstration values, not verified prices
      </label>
    </div>
  );
}

function CityFields({ city }) {
  return (
    <div className={gridClass}>
      <Field label="City"><input className={fieldClass} name="name" defaultValue={city?.name ?? ""} required maxLength="100" /></Field>
      <Field label="State"><input className={fieldClass} name="state" defaultValue={city?.state ?? ""} required maxLength="100" /></Field>
      <Field label="Country"><input className={fieldClass} name="country" defaultValue={city?.country ?? "India"} required maxLength="100" /></Field>
    </div>
  );
}

function ModelSpecialties({ models, selected = [] }) {
  return (
    <fieldset className="sm:col-span-2 lg:col-span-3">
      <legend className="form-label">Eligible models for lead assignment</legend>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2">
        {models.map((model) => (
          <label key={model.id} className="flex items-center gap-2 text-xs text-[var(--ink)]">
            <input
              type="checkbox"
              name="modelIds"
              value={model.id}
              defaultChecked={selected.some((entry) => entry.modelId === model.id)}
            />
            {model.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function VehicleImages({ vehicle }) {
  return (
    <section className="mt-6 border-t border-[var(--line)] pt-5">
      <h4 className="text-sm font-medium">Vehicle images</h4>
      <p className="mt-1 text-xs text-[var(--muted)]">Only HTTPS images from images.unsplash.com are accepted as demo placeholders.</p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        {vehicle.images.map((image) => (
          <div key={image.id} className="border border-[var(--line)] p-3">
            <AdminActionForm action={saveVehicleImage} submitLabel="Update image">
              <input type="hidden" name="imageId" value={image.id} />
              <input type="hidden" name="vehicleStockId" value={vehicle.stockId} />
              <div className="grid gap-3">
                <Field label="Image URL"><input className={fieldClass} name="url" type="url" defaultValue={image.url} required /></Field>
                <Field label="Description"><input className={fieldClass} name="altText" defaultValue={image.altText} required maxLength="200" /></Field>
                <Field label="Display order"><input className={fieldClass} name="sortOrder" type="number" min="0" defaultValue={vehicle.images.indexOf(image)} /></Field>
              </div>
            </AdminActionForm>
            <AdminActionForm action={deleteVehicleImage} className="mt-2" showSubmit={false}>
              <input type="hidden" name="imageId" value={image.id} />
              <input type="hidden" name="vehicleStockId" value={vehicle.stockId} />
              <button className="mt-2 text-xs text-red-700 underline disabled:opacity-50" type="submit">Remove image</button>
            </AdminActionForm>
          </div>
        ))}
      </div>
      <AdminActionForm action={saveVehicleImage} className="mt-4">
        <input type="hidden" name="vehicleStockId" value={vehicle.stockId} />
        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="Image URL"><input className={fieldClass} name="url" type="url" required placeholder="https://images.unsplash.com/…" /></Field>
          <Field label="Description"><input className={fieldClass} name="altText" required maxLength="200" /></Field>
          <Field label="Display order"><input className={fieldClass} name="sortOrder" type="number" min="0" defaultValue={vehicle.images.length} /></Field>
        </div>
      </AdminActionForm>
    </section>
  );
}

function Field({ label, children }) {
  return <label className={labelClass}>{label}{children}</label>;
}

function FuelSelect({ defaultValue = "PETROL" }) {
  return (
    <Field label="Fuel">
      <select className={fieldClass} name="fuel" defaultValue={defaultValue}>
        {["PETROL", "DIESEL", "ELECTRIC", "HYBRID", "OTHER"].map((fuel) => (
          <option key={fuel} value={fuel}>{displayFuel(fuel)}</option>
        ))}
      </select>
    </Field>
  );
}

function EmptyState({ text }) {
  return <Card className="p-8 text-center text-sm text-[var(--muted)]">{text}</Card>;
}

function dateInputValue(value) {
  return value ? new Date(value).toISOString().slice(0, 10) : "";
}
