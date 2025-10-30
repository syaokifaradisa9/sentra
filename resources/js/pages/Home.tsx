import { Head } from '@inertiajs/react';

export default function Home() {
    return (
        <>
            <Head title="Home" />
            <div className="min-h-screen bg-gray-100 flex items-center justify-center">
                <h1 className="text-4xl font-bold text-gray-800">Hello World</h1>
            </div>
        </>
    );
}