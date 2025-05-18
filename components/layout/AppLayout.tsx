"use client"

import { ReactNode, useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Nav } from './nav';
import { Sidebar } from './sidebar';
import Chatbot from '../shared/Chatbot';

interface AppLayoutProps {
    children: ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
    const { data: session } = useSession();
    const isAuthenticated = !!session;
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

    // Listen for changes to the localStorage to detect sidebar state changes
    useEffect(() => {
        const checkCollapsedState = () => {
            const collapsed = localStorage.getItem('sidebarCollapsed') === 'true';
            setSidebarCollapsed(collapsed);
        };

        // Check on mount
        checkCollapsedState();

        // Create a custom event listener for sidebar state changes
        const storageHandler = () => {
            checkCollapsedState();
        };

        window.addEventListener('storage', storageHandler);

        // Create a mutation observer to detect direct DOM changes
        const observer = new MutationObserver(() => {
            checkCollapsedState();
        });

        // Add a custom event listener for our sidebar toggle
        window.addEventListener('sidebarToggle', checkCollapsedState);

        return () => {
            window.removeEventListener('storage', storageHandler);
            window.removeEventListener('sidebarToggle', checkCollapsedState);
            observer.disconnect();
        };    }, []);
    
    return (
        <div className="flex min-h-screen flex-col">
            <Nav />
            <div className="flex flex-1">
                {isAuthenticated && <Sidebar />}
                <main
                    className={`flex-1 transition-all duration-300 ease-in-out ${isAuthenticated ? (sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64') : ''
                        }`}
                >
                    <div className="w-full h-full py-6 px-4 sm:px-6 lg:px-8">
                        {children}
                    </div>
                </main>
            </div>
            {/* Add Chatbot component */}
            <Chatbot />
        </div>
    );
}