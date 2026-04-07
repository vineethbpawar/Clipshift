CREATE TABLE `chat_messages` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`sender_id` int NOT NULL,
	`receiver_id` int NOT NULL,
	`message_text` text,
	`message_type` enum('text','file','voice_note') NOT NULL,
	`file_url` text,
	`voice_note_url` text,
	`is_read` boolean DEFAULT false,
	`read_at` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `chat_messages_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `deliverables` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`video_url` text NOT NULL,
	`video_duration_seconds` int NOT NULL,
	`file_size_mb` decimal(10,2) NOT NULL,
	`quality_metrics` json,
	`uploaded_at` timestamp NOT NULL,
	`downloaded_by_client` boolean DEFAULT false,
	`downloaded_at` timestamp,
	CONSTRAINT `deliverables_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `disputes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`initiator_id` int NOT NULL,
	`reason` text NOT NULL,
	`status` enum('open','resolved','closed') NOT NULL,
	`resolution_type` enum('full_refund','partial_refund','no_refund','custom'),
	`resolution_amount` decimal(10,2),
	`admin_notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`resolved_at` timestamp,
	CONSTRAINT `disputes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`type` enum('order_assigned','message_received','job_completed','payment_received','review_received','job_request','order_status_update','dispute_resolved') NOT NULL,
	`title` varchar(255) NOT NULL,
	`body` text NOT NULL,
	`related_order_id` int,
	`is_read` boolean DEFAULT false,
	`read_at` timestamp,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` int AUTO_INCREMENT NOT NULL,
	`client_id` int NOT NULL,
	`editor_id` int,
	`videographer_id` int,
	`service_type` enum('editing_only','videography_only','shoot_and_edit') NOT NULL,
	`status` enum('pending','assigned','in_progress','completed','cancelled') NOT NULL,
	`editing_style` enum('basic','advanced','premium'),
	`video_url` text,
	`video_duration_seconds` int,
	`instructions_text` text,
	`instructions_voice_url` text,
	`delivery_time_hours` int NOT NULL,
	`price` decimal(10,2) NOT NULL,
	`commission_amount` decimal(10,2) NOT NULL,
	`professional_amount` decimal(10,2) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`assigned_at` timestamp,
	`started_at` timestamp,
	`completed_at` timestamp,
	`deadline` timestamp NOT NULL,
	`revision_count` int DEFAULT 0,
	`revision_requested` boolean DEFAULT false,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`amount` decimal(10,2) NOT NULL,
	`currency` varchar(3) DEFAULT 'INR',
	`payment_method` enum('upi','debit_card','credit_card','net_banking','wallet','cod') NOT NULL,
	`status` enum('pending','completed','failed','refunded') NOT NULL,
	`transaction_id` varchar(255),
	`payment_gateway` enum('razorpay','stripe') NOT NULL,
	`escrow_status` enum('held','released','refunded') NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`completed_at` timestamp,
	`refunded_at` timestamp,
	`metadata` json,
	CONSTRAINT `payments_id` PRIMARY KEY(`id`),
	CONSTRAINT `payments_transaction_id_unique` UNIQUE(`transaction_id`)
);
--> statement-breakpoint
CREATE TABLE `platform_settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`commission_percentage` decimal(5,2) DEFAULT '25',
	`min_order_price` decimal(10,2) DEFAULT '500',
	`max_order_price` decimal(10,2) DEFAULT '50000',
	`default_delivery_hours` json,
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `platform_settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `professional_profiles` (
	`id` int AUTO_INCREMENT NOT NULL,
	`user_id` int NOT NULL,
	`specializations` json,
	`portfolio_urls` json,
	`hourly_rate` decimal(10,2),
	`min_project_size` int,
	`availability_status` enum('available','unavailable','on_break') DEFAULT 'available',
	`response_time_hours` int DEFAULT 24,
	`completion_rate` decimal(5,2) DEFAULT '0',
	`on_time_rate` decimal(5,2) DEFAULT '0',
	`service_area_radius_km` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `professional_profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` int AUTO_INCREMENT NOT NULL,
	`order_id` int NOT NULL,
	`reviewer_id` int NOT NULL,
	`reviewee_id` int NOT NULL,
	`rating` int NOT NULL,
	`comment` text,
	`categories` json,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `videographer_availability` (
	`id` int AUTO_INCREMENT NOT NULL,
	`videographer_id` int NOT NULL,
	`date` date NOT NULL,
	`start_time` time NOT NULL,
	`end_time` time NOT NULL,
	`is_available` boolean DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `videographer_availability_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` ADD `userType` enum('client','editor','videographer');--> statement-breakpoint
ALTER TABLE `users` ADD `avatar_url` text;--> statement-breakpoint
ALTER TABLE `users` ADD `bio` text;--> statement-breakpoint
ALTER TABLE `users` ADD `location` varchar(255);--> statement-breakpoint
ALTER TABLE `users` ADD `rating` decimal(3,2) DEFAULT '0';--> statement-breakpoint
ALTER TABLE `users` ADD `total_reviews` int DEFAULT 0;--> statement-breakpoint
ALTER TABLE `users` ADD `verified_badge` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `top_rated_badge` boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE `users` ADD `is_active` boolean DEFAULT true;--> statement-breakpoint
ALTER TABLE `users` ADD `deleted_at` timestamp;