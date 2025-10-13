import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { FileText } from 'lucide-react'
import React from 'react'

export default function ActionButton() {
  return (
     <div className="flex justify-end gap-2 mt-6">
                  <Button variant="outline">Save Draft</Button>
                  <Button variant="outline">
                    <FileText className="w-4 h-4 mr-1" /> Print
                  </Button>
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700"
                      
                    >
                      Complete Consultation
                    </Button>
                  </motion.div>
                </div>
  )
}
