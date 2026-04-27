export default function MarketingLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen">
            <header className="p-4 border-b">
                <h1 className="font-bold text-lg">HelpDesk System</h1>
            </header>

            <main>{children}</main>
        </div>
    );
}