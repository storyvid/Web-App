import React from 'react';
import { Card, CardContent } from "../ui/card";
import { motion } from "framer-motion";

export default function AdminStatsCard({ 
  title, 
  value, 
  icon: Icon, 
  delay = 0 
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
    >
      <Card className="bg-white border border-[#E5E5E5] shadow-none rounded-xl p-5">
        <CardContent className="p-0">
          <div className="flex items-center gap-2 text-sm text-[#7D7A73] mb-1">
            {Icon && <Icon className="w-4 h-4" />}
            <span>{title}</span>
          </div>
          <p className="text-5xl font-bold text-[#1F1C15] font-sans">{value}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
}