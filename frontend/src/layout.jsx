import React, { use } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Header from './components/top_header/header.jsx';
import ContextMenu from './components/context-menu/ContextMenu.jsx';
import { useEffect, useState } from 'react';
import Alert from './components/alert/Alert.jsx';
import Loader from './components/loader/Loader.jsx';
import FetchData from './api/api.js';

export default function Layout() {
    const [showAlert, setShowAlert] = useState(false);
    const [alertType, setAlertType] = useState('');
    const [alertMessage, setAlertMessage] = useState('');
    const navigate = useNavigate();

    const [showLoader, setShowLoader] = useState(false);
    const [loaderMessage, setLoaderMessage] = useState('Loading...');

    const [authToken, setAuthToken] = useState(null);
    const [myEmail, setMyEmail] = useState(null);

    // Global record books metadata and data (initially empty, fetched from API)
    const initialRecordBooks = []

    // create sample records (not used now)
    const buildSample = (attrs, i) => {
        const sample = {};
        attrs.forEach((attr) => {
            // generate simple sample values
            sample[attr.field_name] = `${attr.field_name}_sample_${i + 1}`;
        });
        // unique id for row operations
        sample._id = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${i}`;
        return sample;
    };

    const initialRecordBookData = {}

    const [recordBooks, setRecordBooks] = useState(initialRecordBooks);
    const [recordBookData, setRecordBookData] = useState(initialRecordBookData);

    // Sidebar links and active state
    const sideBarLinksAndSvgIcons = [
        {
            name: "Home",
            path: `/dashboard/recordbook/${recordBooks[0].id}`,
            svgIcon: `
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" 
                xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M11.293 3.293a1 1 0 0 1 1.414 0l6 6 
                2 2a1 1 0 0 1-1.414 1.414L19 12.414V19a2 2 0 0 1-2 2h-3a1 1 
                0 0 1-1-1v-3h-2v3a1 1 0 0 1-1 1H7a2 2 0 0 1-2-2v-6.586l-.293.293a1 
                1 0 0 1-1.414-1.414l2-2 6-6Z" clip-rule="evenodd"/>
            </svg>
            `,
        },
        {
            name: "Record books",
            path: "/dashboard/recordbooks",
            svgIcon: `
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" 
                xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M11 4.717c-2.286-.58-4.16-.756-7.045-.71A1.99 
                1.99 0 0 0 2 6v11c0 1.133.934 2.022 2.044 2.007 2.759-.038 4.5.16 
                6.956.791V4.717Zm2 15.081c2.456-.631 4.198-.829 6.956-.791A2.013 
                2.013 0 0 0 22 16.999V6a1.99 1.99 0 0 0-1.955-1.993c-2.885-.046-4.76.13-7.045.71v15.081Z" clip-rule="evenodd"/>
            </svg>
            `,
        },
        {
            name: "Email Linkage",
            path: "/dashboard/emails-linkage",
            svgIcon: `
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" 
                xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                fill="none" viewBox="0 0 24 24">
                <path stroke="currentColor" stroke-linecap="round" stroke-width="2" 
                d="M13.2131 9.78732c-.6359-.63557-1.4983-.99259-2.3974-.99259-.89911 
                0-1.76143.35702-2.39741.99259l-3.4253 3.42528C4.35719 13.8485 4 
                14.7108 4 15.61c0 .8992.35719 1.7616.99299 2.3974.63598.6356 
                1.4983.9926 2.39742.9926.89912 0 1.76144-.357 2.39742-.9926l.32157-.3043m-.32157-4.4905c.63587.6358 
                1.49827.993 2.39747.993.8991 0 1.7615-.3572 2.3974-.993l3.4243-3.42528c.6358-.63585.993-1.49822.993-2.39741 
                0-.89919-.3572-1.76156-.993-2.39741C17.3712 4.357 16.509 4 15.6101 
                4c-.899 0-1.7612.357-2.397.9925l-1.0278.96062m7.3873 14.04678-1.7862-1.7862m0 
                0L16 16.4274m1.7864 1.7863 1.7862-1.7863m-1.7862 1.7863L16 20"/>
            </svg>
            `,
        },
        {
            name: "Reports",
            path: "/dashboard/reports",
            svgIcon: `
            <svg class="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" 
                xmlns="http://www.w3.org/2000/svg" width="24" height="24" 
                fill="currentColor" viewBox="0 0 24 24">
                <path fill-rule="evenodd" d="M11 4.717c-2.286-.58-4.16-.756-7.045-.71A1.99 
                1.99 0 0 0 2 6v11c0 1.133.934 2.022 2.044 2.007 2.759-.038 4.5.16 
                6.956.791V4.717Zm2 15.081c2.456-.631 4.198-.829 6.956-.791A2.013 
                2.013 0 0 0 22 16.999V6a1.99 1.99 0 0 0-1.955-1.993c-2.885-.046-4.76.13-7.045.71v15.081Z" clip-rule="evenodd"/>
            </svg>
            `,
        },
    ];

    const [activeSidebarLink, setActiveSidebarLink] = useState('/dashboard');

    // Context Menu State
    const [showContextMenu, setShowContextMenu] = useState(false);
    const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        if (alertMessage !== '' && alertType !== '') {
            setShowAlert(true);
        }
    }, [alertType, alertMessage,]);

    // Initialize from localStorage on mount
    useEffect(() => {
        const savedToken = localStorage.getItem('authToken');
        const savedEmail = localStorage.getItem('userEmail');

        if (savedToken) {
            setAuthToken(savedToken);
        }
        if (savedEmail) {
            setMyEmail(savedEmail);
        }
    }, []);


    useEffect(() => {
        if (authToken) {
            localStorage.setItem('authToken', authToken);
        }
    }, [authToken]);

    useEffect(() => {
        if (myEmail) {
            localStorage.setItem('userEmail', myEmail);
        }
    }, [myEmail]);

    const handleLogout = () => {
        setAuthToken(null);
        setMyEmail(null);
        localStorage.clear();
        navigate('/');
        setAlertType('success');
        setAlertMessage('Logged out successfully');
    };

    const handleQuit = () => {
        if (window.electronAPI) {
            window.electronAPI.quit();
        } else {
            console.log('Electron API not available');
        }
    };

    const reLoadApp = () => {

        window.location.reload();

    };

    useEffect(() => {
        if (authToken && myEmail) {
            const fetchRecordBooks = async () => {
                try {
                    setShowLoader(true);
                    setLoaderMessage('Loading record books...');
                    const response = await FetchData('recordbooks', 'GET', null, authToken, myEmail);
                    if (response.status && response.type === 'success') {
                        const mappedRecordBooks = response.collections.map(c => ({
                            id: c._id,
                            name: c.collection_name,
                            attributes: c.fields,
                            total: c.total
                        }));
                        setRecordBooks(mappedRecordBooks);

                        // Fetch records for each collection
                        const recordDataPromises = mappedRecordBooks.map(async (rb) => {
                            try {
                                const recordsResponse = await FetchData(`recordbook/${rb.name}`, 'GET', null, authToken, myEmail);
                                if (recordsResponse.status) {
                                    return { id: rb.id, records: recordsResponse.records };
                                } else {
                                    console.error(`Failed to fetch records for ${rb.name}:`, recordsResponse.message);
                                    return { id: rb.id, records: [] };
                                }
                            } catch (error) {
                                console.error(`Error fetching records for ${rb.name}:`, error);
                                return { id: rb.id, records: [] };
                            }
                        });

                        const recordDataResults = await Promise.all(recordDataPromises);
                        const initialData = {};
                        recordDataResults.forEach(result => {
                            initialData[result.id] = result.records;
                        });
                        setRecordBookData(initialData);

                        setShowLoader(false);
                    } else {
                        setAlertType('error');
                        setAlertMessage('Failed to load record books');
                        setShowAlert(true);
                        setShowLoader(false);
                    }
                } catch (error) {
                    console.error('Error fetching record books:', error);
                    setAlertType('error');
                    setAlertMessage('Error loading record books');
                    setShowAlert(true);
                    setShowLoader(false);
                }
            };
            fetchRecordBooks();
        }
    }, [authToken, myEmail]);

    const contextMenuItems = authToken ? [

        {
            label: 'Reload',
            action: reLoadApp,
            tooltip: 'Reload the application'
        },
        {
            type: 'divider'
        }
        ,
        {
            label: 'Logout',
            action: handleLogout,
            tooltip: 'Sign out from your account'
        },
        {
            type: 'divider'
        },
        {
            label: 'Quit',
            action: handleQuit,
            danger: true,
            tooltip: 'Close the application'
        }
    ] : [
        ,
        {
            label: 'Reload',
            action: reLoadApp,
            tooltip: 'Reload the application'
        },
        {
            type: 'divider'
        }
        ,
        {
            label: 'Quit',
            action: handleQuit,
            danger: true,
            tooltip: 'Close the application'
        }
    ];

    const handleContextMenu = (e) => {
        e.preventDefault();
        setContextMenuPosition({ x: e.clientX, y: e.clientY });
        setShowContextMenu(true);
    };

    const handleAlertClose = () => {
        setShowAlert(false);
        setAlertMessage('');
        setAlertType('');
    };

    const handleLoaderClose = () => {
        setShowLoader(false);
        setLoaderMessage('Loading...');
    };

    return (
        <div className="layout" onContextMenu={handleContextMenu}>
            <div className="header-controller">
                <Header />
            </div>
            <div className="outlet-controller">
                <Alert type={alertType} message={alertMessage} show={showAlert} onClose={handleAlertClose} />
                <Loader message={loaderMessage} show={showLoader} onClose={handleLoaderClose} />
                <ContextMenu
                    items={contextMenuItems}
                    show={showContextMenu}
                    position={contextMenuPosition}
                    onClose={() => setShowContextMenu(false)}
                />
                <Outlet context={{
                    setAlertType,
                    setAlertMessage,
                    setShowAlert,
                    setShowLoader,
                    setLoaderMessage,
                    authToken,
                    setAuthToken,
                    myEmail,
                    setMyEmail,
                    // global recordbook data/context
                    recordBooks,
                    recordBookData,
                    setRecordBookData,
                    setRecordBooks,
                    // sidebar data
                    sideBarLinksAndSvgIcons,
                    activeSidebarLink,
                    setActiveSidebarLink
                }} />
            </div>
        </div>
    );
}