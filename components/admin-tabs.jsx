import { vehicles } from "../lib/mock-data";
import { displayAvailability, formatPrice } from "../lib/format";
import { Card, Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/primitives";
import { DemoNotice, InfoNotice } from "./ui";

const models = Array.from(
  new Map(vehicles.map((vehicle) => [`${vehicle.model}-${vehicle.variant}`, vehicle])).values(),
);

export default function AdminTabs({ showrooms, consultants }) {
  return (
    <div>
      <div className="mb-5">
        <DemoNotice>
          Admin screens are read-only previews. No inventory or pricing changes can be saved.
        </DemoNotice>
      </div>
      <Tabs defaultValue="inventory">
        <TabsList className="mb-5 overflow-x-auto bg-white px-2">
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="models">Models & variants</TabsTrigger>
          <TabsTrigger value="pricing">City pricing</TabsTrigger>
          <TabsTrigger value="showrooms">Showrooms</TabsTrigger>
          <TabsTrigger value="consultants">Consultants</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory">
          <Card className="overflow-hidden">
            <Table headings={["Stock ID", "Type", "Model / variant", "Fuel", "Year / km", "Price", "Status"]}>
              {vehicles.map((vehicle) => (
                <tr key={vehicle.stockId} className="border-b border-[var(--line)] last:border-0">
                  <Cell strong>{vehicle.stockId}</Cell>
                  <Cell>{vehicle.type === "NEW" ? "New" : "Used"}</Cell>
                  <Cell>{vehicle.model} · {vehicle.variant}</Cell>
                  <Cell>{vehicle.fuel.charAt(0) + vehicle.fuel.slice(1).toLowerCase()}</Cell>
                  <Cell>{vehicle.year} · {vehicle.kilometres.toLocaleString("en-IN")} km</Cell>
                  <Cell>{formatPrice(vehicle.priceInr)} {vehicle.priceBasis === "EX_SHOWROOM" ? "ex-showroom" : "listing"}</Cell>
                  <Cell>{displayAvailability(vehicle.status)}</Cell>
                </tr>
              ))}
            </Table>
            <p className="border-t border-[var(--line)] px-5 py-4 text-xs text-[var(--muted)]">
              Official sample inventory only. Add/edit actions await a connected and authorized admin service.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <Card className="overflow-hidden">
            <Table headings={["Model", "Variant", "Fuel", "Stock records"]}>
              {models.map((vehicle) => (
                <tr key={`${vehicle.model}-${vehicle.variant}`} className="border-b border-[var(--line)] last:border-0">
                  <Cell strong>{vehicle.model}</Cell>
                  <Cell>{vehicle.variant}</Cell>
                  <Cell>{vehicle.fuel.charAt(0) + vehicle.fuel.slice(1).toLowerCase()}</Cell>
                  <Cell>{vehicles.filter((item) => item.model === vehicle.model && item.variant === vehicle.variant).length}</Cell>
                </tr>
              ))}
            </Table>
            <p className="border-t border-[var(--line)] px-5 py-4 text-xs text-[var(--muted)]">
              This view is derived from the exact records in the brief, not a complete Brand X catalogue.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="pricing">
          <Card className="p-5 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">City-wise pricing</p>
            <h2 className="mt-3 text-2xl font-medium text-[var(--ink)]">Pricing inputs are not configured.</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--muted)]">
              Only Lucknow is identified in the client brief. No road-tax, registration, insurance, or additional fee schedules were supplied, so no on-road totals are shown or invented.
            </p>
            <div className="mt-6">
              <InfoNotice title="New vehicle price basis:">
                NEW-H-02 is ₹12,45,000 ex-showroom. Used-car prices are their listing prices.
              </InfoNotice>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="showrooms">
          <Card className="p-5 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Facilities</p>
            <h2 className="mt-3 text-2xl font-medium text-[var(--ink)]">Company A locations in Lucknow</h2>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {showrooms.map((showroom) => (
                <div key={showroom.id} className="border border-[var(--line)] p-4">
                  <p className="text-sm font-medium text-[var(--ink)]">{showroom.label}</p>
                  <p className="mt-2 text-xs text-[var(--muted)]">Address not supplied</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-xs text-[var(--muted)]">
              The client brief also confirms two service workshops and one certified used-car yard; individual names and addresses are not available.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="consultants">
          <Card className="p-5 sm:p-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--accent)]">Consultant access</p>
            <h2 className="mt-3 text-2xl font-medium text-[var(--ink)]">No consultant directory supplied.</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Add real staff accounts after Company A provides the roster and access rules. This preview does not invent consultant names or allow account changes.
            </p>
            <p className="mt-5 text-xs text-[var(--muted)]">{consultants.length} consultant records available in preview.</p>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Table({ headings, children }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[780px] border-collapse text-left">
        <thead>
          <tr className="border-b border-[var(--line)] bg-[#fbfbfa]">
            {headings.map((heading) => (
              <th key={heading} className="px-4 py-3 text-[10px] font-semibold uppercase tracking-[0.13em] text-[var(--muted)]">{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function Cell({ children, strong = false }) {
  return <td className={`px-4 py-4 text-xs ${strong ? "font-medium text-[var(--ink)]" : "text-[var(--muted)]"}`}>{children}</td>;
}
