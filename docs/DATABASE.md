# Database Design

## Core entities

### Authentication and access
- User
- Role
- EmailVerification
- PasswordReset
- LoginSession

### Business domain
- BusinessProfile
- BusinessCategory
- BusinessSocialAccount
- BusinessLocation
- BusinessDocument

### Influencer domain
- InfluencerProfile
- InfluencerCategory
- InfluencerCategoryMapping
- SocialAccount
- InfluencerPricing
- InfluencerAvailability
- InfluencerVerification
- InfluencerPortfolio

### Services and commerce
- Service
- ServiceCategory
- Package
- PackageService
- ServiceRequest
- Order

### Campaigns
- Campaign
- CampaignParticipant
- CampaignInvitation
- CampaignDeliverable
- CampaignSubmission
- CampaignRevision
- CampaignAgreement
- CampaignPerformance

### Communication and marketplace
- InfluencerMatch
- Shortlist
- ShortlistItem
- Conversation
- ConversationParticipant
- Message
- MessageAttachment
- MessageReadStatus

### Financials
- Payment
- PaymentTransaction
- PlatformFee
- InfluencerPayout
- Refund
- Invoice

### Reviews and support
- Review
- ReviewResponse
- SupportTicket
- Dispute
- DisputeEvidence

### Notifications and CRM
- Notification
- NotificationPreference
- Lead
- LeadActivity
- LeadStatus
- AdminSetting
- AuditLog

## Design principles

- Relational normalization over duplication
- Proper foreign keys and indexes for common filters
- Soft delete where appropriate
- Status choices for campaigns, reviews, and payment life cycles
- Separate metadata tables for uploads and history

## Recommended indexes

- users.role
- business_profiles.city
- influencer_profiles.city
- influencer_profiles.verification_status
- campaigns.status
- campaigns.business_id
- message.conversation_id
- payments.status
- leads.status

## Migration strategy

Migrations are managed through Django and should be generated within each domain app as features are added.
