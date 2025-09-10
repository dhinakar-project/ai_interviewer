import VAPIDebugger from "@/components/VAPIDebugger";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function DebugPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto space-y-8">
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <h1 className="text-3xl font-bold text-gray-900">VAPI Debug Console</h1>
                        <p className="text-gray-600">
                            Use this page to diagnose VAPI configuration issues and test your setup.
                        </p>
                        <Button asChild variant="outline">
                            <Link href="/">
                                ← Back to Dashboard
                            </Link>
                        </Button>
                    </div>

                    {/* Debugger Component */}
                    <VAPIDebugger />

                    {/* Troubleshooting Guide */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4">Troubleshooting Guide</h3>
                        <div className="space-y-4 text-sm text-gray-700">
                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">1. Check Environment Variables</h4>
                                <p>Make sure you have these environment variables set in your <code className="bg-gray-100 px-1 rounded">.env.local</code> file:</p>
                                <pre className="bg-gray-100 p-3 rounded-lg mt-2 text-xs overflow-x-auto">
{`NEXT_PUBLIC_VAPI_WEB_TOKEN=your_vapi_token_here
NEXT_PUBLIC_VAPI_WORKFLOW_ID=your_workflow_id_here`}
                                </pre>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">2. Verify VAPI Subscription</h4>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Check your VAPI dashboard for active subscription</li>
                                    <li>Ensure you have sufficient credits</li>
                                    <li>Verify your API key is valid and not expired</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">3. Browser Requirements</h4>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Use a modern browser (Chrome, Firefox, Safari, Edge)</li>
                                    <li>Enable microphone permissions</li>
                                    <li>Check that WebRTC is supported</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-medium text-gray-900 mb-2">4. Network Issues</h4>
                                <ul className="list-disc list-inside space-y-1 ml-4">
                                    <li>Check your internet connection</li>
                                    <li>Try disabling VPN if you're using one</li>
                                    <li>Check if VAPI services are accessible from your location</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Common Error Solutions */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold mb-4">Common Error Solutions</h3>
                        <div className="space-y-4 text-sm">
                            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                                <h4 className="font-medium text-red-900 mb-2">"VAPI Error: {}"</h4>
                                <p className="text-red-700 mb-2">This usually indicates:</p>
                                <ul className="list-disc list-inside text-red-700 ml-4 space-y-1">
                                    <li>Missing or invalid VAPI token</li>
                                    <li>Network connectivity issues</li>
                                    <li>Browser compatibility problems</li>
                                    <li>Subscription/credits expired</li>
                                </ul>
                            </div>

                            <div className="p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                                <h4 className="font-medium text-yellow-900 mb-2">Permission Denied</h4>
                                <p className="text-yellow-700">Allow microphone access when prompted by your browser.</p>
                            </div>

                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <h4 className="font-medium text-blue-900 mb-2">Connection Timeout</h4>
                                <p className="text-blue-700">Try refreshing the page or restarting your browser.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}























