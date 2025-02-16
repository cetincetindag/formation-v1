import { Card } from "~/components/ui/card";

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="mx-auto max-w-2xl p-6">
        <h1 className="mb-6 text-3xl font-bold">Contact Us</h1>
        <div className="space-y-4">
          <div>
            <h2 className="mb-2 text-xl font-semibold">Cetin Cetindag</h2>
            <p className="text-muted-foreground">Lead Developer, Dapple Studios</p>
          </div>
          <div>
            <h3 className="mb-1 font-medium">Email</h3>
            <p className="text-muted-foreground">cetincetindag@outlook.com</p>
          </div>
          <div>
            <h3 className="mb-1 font-medium">Location</h3>
            <p className="text-muted-foreground">Izmir, Turkiye</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
