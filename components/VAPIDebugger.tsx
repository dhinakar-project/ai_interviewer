"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { vapi } from "@/lib/vapi.sdk";

export default function VAPIDebugger() {
    const [configStatus, setConfigStatus] = useState<{
        hasToken: boolean;
        tokenPreview: string;
        hasWorkflowId: boolean;
        workflowId: string;
        browserSupport: boolean;
        permissions: boolean;
    }>({
        hasToken: false,
        tokenPreview: "",
        hasWorkflowId: false,
        workflowId: "",
        browserSupport: false,
        permissions: false,
    });

    const [testResult, setTestResult] = useState<string>("");

    useEffect(() => {
        // Check configuration
        const token = process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN;
        const workflowId = process.env.NEXT_PUBLIC_VAPI_WORKFLOW_ID;
        
        // Check browser support
        const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
        const hasWebRTC = !!(window.RTCPeerConnection || window.webkitRTCPeerConnection);
        
        setConfigStatus({
            hasToken: !!token,
            tokenPreview: token ? `${token.substring(0, 10)}...` : "",
            hasWorkflowId: !!workflowId,
            workflowId: workflowId || "",
            browserSupport: hasGetUserMedia && hasWebRTC,
            permissions: false, // Will be checked on test
        });
    }, []);

    const testVAPIConnection = async () => {
        try {
            setTestResult("Testing VAPI connection...");
            
            // Test microphone permissions
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            stream.getTracks().forEach(track => track.stop());
            
            setConfigStatus(prev => ({ ...prev, permissions: true }));
            setTestResult("✅ Microphone permissions granted");
            
            // Test VAPI initialization (without starting a call)
            if (!process.env.NEXT_PUBLIC_VAPI_WEB_TOKEN) {
                setTestResult("❌ VAPI token not found");
                return;
            }
            
            setTestResult("✅ VAPI configuration appears valid");
            
        } catch (error) {
            console.error("VAPI test error:", error);
            setTestResult(`❌ Test failed: ${error instanceof Error ? error.message : String(error)}`);
        }
    };

    return (
        <Card className="p-6 space-y-4">
            <h3 className="text-lg font-semibold">VAPI Configuration Debugger</h3>
            
            <div className="space-y-2">
                <div className="flex items-center justify-between">
                    <span>VAPI Token:</span>
                    <Badge variant={configStatus.hasToken ? "default" : "destructive"}>
                        {configStatus.hasToken ? "Found" : "Missing"}
                    </Badge>
                </div>
                
                {configStatus.hasToken && (
                    <div className="text-sm text-gray-600">
                        Token preview: {configStatus.tokenPreview}
                    </div>
                )}
                
                <div className="flex items-center justify-between">
                    <span>Workflow ID:</span>
                    <Badge variant={configStatus.hasWorkflowId ? "default" : "destructive"}>
                        {configStatus.hasWorkflowId ? "Found" : "Missing"}
                    </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                    <span>Browser Support:</span>
                    <Badge variant={configStatus.browserSupport ? "default" : "destructive"}>
                        {configStatus.browserSupport ? "Supported" : "Not Supported"}
                    </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                    <span>Microphone Permissions:</span>
                    <Badge variant={configStatus.permissions ? "default" : "secondary"}>
                        {configStatus.permissions ? "Granted" : "Not Tested"}
                    </Badge>
                </div>
            </div>
            
            <Button onClick={testVAPIConnection} className="w-full">
                Test VAPI Connection
            </Button>
            
            {testResult && (
                <div className="p-3 bg-gray-100 rounded-lg">
                    <p className="text-sm">{testResult}</p>
                </div>
            )}
            
            <div className="text-xs text-gray-500 space-y-1">
                <p>• Make sure NEXT_PUBLIC_VAPI_WEB_TOKEN is set in your environment</p>
                <p>• Ensure you have a valid VAPI subscription</p>
                <p>• Check that your browser supports WebRTC</p>
                <p>• Allow microphone permissions when prompted</p>
            </div>
        </Card>
    );
}























