'use client'
import useProject from "@/hooks/use-project";
import { Github } from "lucide-react";
import React from "react";

const DashboardPage = () => {
    const { project } = useProject()
    return (
        <div>
            <div className="flex items-center justify-between flex-wrap gap-y-4">
                <div className="w-fit rounded-md bg-primary px-4 py-3">
                    <Github className="size-5 text-white" />
                    <div className="ml-2">
                        <p className="text-sm font-medium text-white"></p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DashboardPage;