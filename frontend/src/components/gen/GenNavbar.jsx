import React, { useState, useMemo } from 'react'
import '../../style/navbar/navbar.css'
import { Navbar, Container, Modal, Button, Dropdown } from "react-bootstrap"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useSelector } from 'react-redux'
import { FaSignOutAlt, FaUserCircle, FaIdBadge, FaChevronDown, FaUser, FaFileInvoiceDollar, FaShieldAlt, FaExclamationCircle, FaLock, FaPowerOff } from 'react-icons/fa'
import navbarData from '../../hooks/navbar/navbar.json'
import navbarImage from '../../assets/SVN.png'
import useLogout from '../../hooks/useLogout'
import userDetails from '../../pages/Dashboard/Common/userDetails.json'

const GovNavbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { userInfo } = useSelector((state) => state.auth)
  const logout = useLogout()
  const roleName = userDetails.users.find(u => String(u.id) === String(userInfo?.selected_role))?.name || userInfo?.role_name || (userInfo?.selected_role !== undefined ? `Role ${userInfo.selected_role}` : 'Guest')
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [query, setQuery] = useState('')
  const [notifications] = useState([
    { id: 1, text: 'New valuation report is available', unread: true },
    { id: 2, text: 'System maintenance scheduled', unread: false }
  ])
  const unreadCount = useMemo(() => notifications.filter(n => n.unread).length, [notifications])

  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname
    if (path === '/excel-text-upload') return 'Excel & Text Upload'
    if (path === '/dashboard') return 'Dashboard'
    if (path === '/') return 'Home'
    // Convert path to title (remove slashes and capitalize)
    return path.split('/').filter(Boolean).map(word => 
      word.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    ).join(' / ')
  }

  const resolveImageSrc = (image) => {
    if (!image) return ''
    if (/^(https?:)|^(data:)|^\//.test(image)) return image
    try {
      return new URL(image, import.meta.url).href
    } catch (e) {
      return image
    }
  }

  const handleSignOut = () => {
    navigate('/login', { replace: true })
  }

  const handleSearch = (e) => {
    e?.preventDefault()
    if (!query) return
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleNotifyClick = () => {
    // for now navigate to notifications page; in a larger app this could open a panel
    navigate('/notifications')
  }

  return (
    <>
    <Navbar expand="lg" className="gen-navbar gov-navbar premium-navbar" sticky="top" role="navigation" aria-label="Main navigation">
      <Container fluid>
        <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gov-brand">
          <div className="brand-mark premium-brand-mark" aria-hidden>
            <img
              src={navbarImage}
              alt="Government Crest"
              loading="lazy"
            />
          </div>
          <div className="brand-text-wrap">
            <span className="brand-text premium-brand-text">{navbarData.Name}</span>
            {/* <span className="brand-subtitle">Examination & Training Portal</span> */}
          </div>
        </Navbar.Brand>

        <div className="d-flex align-items-center ms-auto">
          {userInfo && (
            <Dropdown align="end">
              <Dropdown.Toggle as="div" style={{ cursor: 'pointer' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  background: '#fff', color: '#1a2035',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: '700', fontSize: '14px', letterSpacing: '0.5px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.2)', userSelect: 'none'
                }}>
                  {(userInfo?.name || userInfo?.user_name || 'U').split(' ').map(n => n[0]).join('').substring(0,2).toUpperCase()}
                </div>
              </Dropdown.Toggle>
              <Dropdown.Menu style={{
                minWidth: '240px', padding: '0', borderRadius: '14px',
                background: '#1a2035', border: 'none',
                boxShadow: '0 12px 40px rgba(0,0,0,0.45)', overflow: 'hidden'
              }}>
                {/* Header */}
                <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                  <p style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: '#fff' }}>
                    {userInfo?.name || userInfo?.user_name || 'User'}
                  </p>
                </div>
                {/* Menu Items */}
                {[
                  { icon: <FaUser size={15} />, label: 'My Profile', onClick: () => navigate('/profile') },
                  { icon: <FaFileInvoiceDollar size={15} />, label: 'Tax Services', onClick: () => {} },
                  { icon: <FaShieldAlt size={15} />, label: 'Secure Lock', onClick: () => {} },
                  { icon: <FaExclamationCircle size={15} />, label: 'Two-Step Verification', onClick: () => {} },
                  { icon: <FaLock size={15} />, label: 'Change Password', onClick: () => navigate('/change-password') },
                ].map((item, i) => (
                  <Dropdown.Item key={i} onClick={item.onClick} style={{
                    color: '#b0bec5', padding: '12px 20px',
                    display: 'flex', alignItems: 'center', gap: '14px',
                    fontSize: '14px', background: 'transparent',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ color: '#7c8db5', flexShrink: 0 }}>{item.icon}</span>
                    {item.label}
                  </Dropdown.Item>
                ))}
                {/* Logout */}
                <Dropdown.Item onClick={() => setShowLogoutModal(true)} style={{
                  color: '#b0bec5', padding: '12px 20px',
                  display: 'flex', alignItems: 'center', gap: '14px',
                  fontSize: '14px', background: 'transparent',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{ color: '#7c8db5', flexShrink: 0 }}><FaPowerOff size={15} /></span>
                  Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          )}
        </div>

      </Container>
    </Navbar>

    <Modal show={showLogoutModal} onHide={() => setShowLogoutModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: '16px', fontWeight: '600', color: '#1e293b' }}>Confirm Logout</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ fontSize: '14px', color: '#475569', padding: '20px 24px' }}>
        Are you sure you want to logout? Any unsaved changes will be lost.
      </Modal.Body>
      <Modal.Footer style={{ justifyContent: 'space-between' }}>
        <Button variant="danger" style={{ fontWeight: '600', minWidth: '90px', background: '#e05c6e', borderColor: '#e05c6e' }}
          onClick={() => { setShowLogoutModal(false); logout(); navigate('/login') }}>
          <FaSignOutAlt style={{ marginRight: '6px' }} /> Logout
        </Button>
        <Button variant="outline-secondary" style={{ fontWeight: '500', minWidth: '90px' }}
          onClick={() => setShowLogoutModal(false)}>Cancel</Button>
      </Modal.Footer>
    </Modal>
    </>
  )
}

export default GovNavbar
