import React from 'react'
export function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex gap-6 text-sm">
            <a
              href="#"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              About
            </a>
            <a
              href="#"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Data Sources
            </a>
            <a
              href="#"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Terms
            </a>
            <a
              href="#"
              className="text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
            >
              Contact
            </a>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center md:text-right">
            All data is open and publicly available under open licenses
          </p>
        </div>
      </div>
    </footer>
  )
}