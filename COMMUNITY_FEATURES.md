# Community Features & Role-Based System

## Overview
This document describes the new community features and role-based system implemented for the Innovare Technical Club platform.

## Role-Based System

### User Roles
1. **Super Admin (Coordinators)**
   - Full access to all features
   - Can manage users, approve registrations
   - Can create/edit/delete polls, announcements, and courses
   - Can bulk import users via CSV

2. **Coordinators**
   - Can create/edit/delete polls, announcements, and courses
   - Cannot manage users or approve registrations
   - Access to community management features

3. **Users**
   - Can view polls, announcements, and course library
   - Can participate in polls (when authenticated)
   - Can reply to announcements (when authenticated)
   - Must be approved by super admin to access features

## Community Features

### 1. Polls System
- **Public Access**: Anyone can view polls
- **Authentication Required**: Users must sign in to vote
- **Admin Management**: Coordinators and super admins can create/edit/delete polls
- **Features**:
  - Multiple choice options
  - Active/Inactive status
  - Vote tracking
  - One vote per user per poll

### 2. Announcements System
- **Public Access**: Anyone can view announcements
- **Authentication Required**: Users must sign in to reply
- **Admin Management**: Coordinators and super admins can create/edit/delete announcements
- **Features**:
  - Important announcements (highlighted)
  - Reply system for community engagement
  - Rich text content

### 3. Course Library
- **Authentication Required**: Only approved users can access
- **Admin Management**: Coordinators and super admins can add/edit/delete courses
- **Features**:
  - Course images and descriptions
  - Direct access URLs
  - Active/Inactive status
  - Organized grid layout

## Authentication System

### Current Implementation
- **Mock Authentication**: Simple localStorage-based system for development
- **Admin Login**: Username/password system for admin access
- **Session Management**: Bearer token-based API authentication

### Future Integration
- **Clerk Integration**: Ready for Clerk authentication system
- **User Approval**: Super admins can approve users after CSV import
- **Role Management**: Dynamic role assignment and permissions

## API Endpoints

### Public Endpoints
- `GET /api/polls` - List all polls
- `GET /api/polls/:id` - Get poll with responses
- `GET /api/announcements` - List all announcements
- `GET /api/announcements/:id` - Get announcement with replies
- `GET /api/course-library` - List all courses
- `GET /api/course-library/:id` - Get specific course

### Authenticated Endpoints
- `POST /api/polls/:id/respond` - Vote in a poll
- `POST /api/announcements/:id/reply` - Reply to announcement

### Admin Endpoints
- `POST /api/admin/polls` - Create poll
- `PATCH /api/admin/polls/:id` - Update poll
- `DELETE /api/admin/polls/:id` - Delete poll
- `POST /api/admin/announcements` - Create announcement
- `PATCH /api/admin/announcements/:id` - Update announcement
- `DELETE /api/admin/announcements/:id` - Delete announcement
- `POST /api/admin/course-library` - Add course
- `PATCH /api/admin/course-library/:id` - Update course
- `DELETE /api/admin/course-library/:id` - Delete course
- `POST /api/admin/users/bulk` - Bulk import users
- `PATCH /api/admin/users/:id/approve` - Approve user

## Database Schema

### New Tables
1. **users** - User accounts with roles and approval status
2. **polls** - Poll questions and options
3. **poll_responses** - User votes on polls
4. **announcements** - Community announcements
5. **announcement_replies** - User replies to announcements
6. **course_library** - Course materials and access URLs

### Key Fields
- **Role-based access**: `role` field (user, coordinator, super_admin)
- **Approval system**: `isApproved` field for user access control
- **Audit trail**: `createdAt`, `updatedAt` timestamps
- **Content management**: Rich text and media support

## Frontend Components

### New Pages
1. **Community Page** (`/community`)
   - Tabs for polls, announcements, and course library
   - Authentication-aware content display
   - Interactive voting and reply systems

2. **Community Management** (`/admin/community`)
   - Admin interface for managing all community content
   - Tabbed interface for different content types
   - CRUD operations for polls, announcements, and courses

### Components
1. **CSV Upload** - Bulk user import functionality
2. **Auth Context** - Authentication state management
3. **Role Guards** - Permission-based access control

## Usage Instructions

### For Super Admins
1. **User Management**:
   - Use CSV upload to bulk import users
   - Approve users individually or in bulk
   - Monitor user activity and engagement

2. **Content Management**:
   - Create engaging polls for community feedback
   - Post important announcements
   - Build comprehensive course library

### For Coordinators
1. **Community Engagement**:
   - Create polls to gather community input
   - Post regular announcements
   - Add relevant course materials

### For Users
1. **Participation**:
   - Sign in to access full features
   - Vote in active polls
   - Reply to announcements
   - Access course library

## Security Features

### Access Control
- **Role-based permissions**: Different access levels for different roles
- **Authentication required**: Sensitive operations require user authentication
- **Admin verification**: User approval system prevents unauthorized access

### Data Validation
- **Input sanitization**: All user inputs are validated and sanitized
- **Schema validation**: Zod schemas ensure data integrity
- **API protection**: Rate limiting and input validation on all endpoints

## Future Enhancements

### Planned Features
1. **Real-time Updates**: WebSocket integration for live community updates
2. **Advanced Analytics**: Poll results and engagement metrics
3. **Content Moderation**: Automated and manual content filtering
4. **Mobile App**: Native mobile application for community engagement
5. **Integration**: Slack/Discord bot integration for notifications

### Clerk Integration
1. **User Authentication**: Replace mock system with Clerk
2. **Social Login**: Google, GitHub, and other OAuth providers
3. **User Profiles**: Rich user profiles with avatars and preferences
4. **Multi-factor Authentication**: Enhanced security for admin accounts

## Development Notes

### Current Status
- ✅ Backend API implementation complete
- ✅ Database schema and storage layer complete
- ✅ Frontend components and pages complete
- ✅ Basic authentication system implemented
- ✅ Role-based access control implemented

### Known Issues
- Mock authentication system (temporary for development)
- Basic error handling (can be enhanced)
- Limited real-time features (planned for future)

### Testing
- Test all CRUD operations for community content
- Verify role-based access control
- Test CSV upload functionality
- Verify authentication flows

## Conclusion

The community features and role-based system provide a solid foundation for community engagement while maintaining security and access control. The system is designed to be scalable and can easily integrate with external authentication providers like Clerk in the future.
