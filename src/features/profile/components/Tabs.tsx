import { Fingerprint, User } from 'lucide-react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Select } from "@/components/ui/select"

const tabs = [
    { name: 'Mi Cuenta', href: '/profile', icon: User },
    { name: 'Cambiar Password', href: '/profile/change-password', icon: Fingerprint },
]

function classNames(...classes: string[]) {
    return classes.filter(Boolean).join(' ')
}

export default function Tabs() {
    const navigate = useNavigate()
    const location = useLocation()
    const currentTab = tabs.filter(tab => tab.href === location.pathname)[0].href
    
    return (
        <div className='mb-10'>
            <div className="sm:hidden">
                <Select
                    value={currentTab}
                    onValueChange={(v) => v && navigate(v)}
                >
                    <Select.Trigger className="w-full">
                        <Select.Value />
                    </Select.Trigger>
                    <Select.Popup>
                        <Select.List>
                            {tabs.map((tab) => (
                                <Select.Item key={tab.name} value={tab.href}>
                                    <tab.icon className="h-4 w-4 mr-2 inline" />
                                    {tab.name}
                                </Select.Item>
                            ))}
                        </Select.List>
                    </Select.Popup>
                </Select>
            </div>

            <div className="hidden sm:block">
                <div className="border-b border-gray-200">
                    <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                        {tabs.map((tab) => (
                            <Link
                                key={tab.name}
                                to={tab.href}
                                className={classNames(
                                    location.pathname === tab.href
                                        ? 'border-brand-primary text-brand-primary'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700',
                                    'group inline-flex items-center border-b-2 py-4 px-1 text-sm font-medium'
                                )}
                            >
                                <tab.icon
                                    className={classNames(
                                        location.pathname === tab.href ? 'text-brand-primary' : 'text-gray-400 group-hover:text-gray-500',
                                        '-ml-0.5 mr-2 h-5 w-5'
                                    )}
                                    aria-hidden="true"
                                />
                                <span>{tab.name}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            </div>
        </div>
    )
}
