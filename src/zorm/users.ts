/**
* AutoGenerated by @zuzjs/orm.
* @ Thu Mar 27 2025 20:20:00
*/
import { Entity, BaseEntity, PrimaryGeneratedColumn, Column } from "@zuzjs/orm";

export enum Utype { Admin = "admin", User = "user", Moderator = "moderator" }
export enum Gender { Unknown = "unknown", Male = "male", Female = "female" }

@Entity({ name: "users" })
export class Users extends BaseEntity {

	@PrimaryGeneratedColumn()
	ID!: number;

	@Column({ type: "varchar", length: 100, default: "none" })
	token!: string;

	@Column({ type: "varchar", length: 20, default: "xxxxxx" })
	ucode!: string;

	@Column({ type: "enum", enum: Utype, default: "user" })
	utype!: Utype;

	@Column({ type: "varchar", length: 355, default: "none" })
	permissions!: string;

	@Column({ type: "varchar", length: 155, default: "none" })
	email!: string;

	@Column({ type: "varchar", length: 155, default: "none" })
	password!: string;

	@Column({ type: "varchar", length: 100, default: "none" })
	fullname!: string;

	@Column({ type: "varchar", length: 100, default: "no-dp.png" })
	picture!: string;

	@Column({ type: "enum", enum: Gender, default: "unknown" })
	gender!: Gender;

	@Column({ type: "varchar", length: 10, default: "00-00-0000" })
	dob!: string;

	@Column({ type: "int", default: 1 })
	affiliate!: number;

	@Column({ type: "int", nullable: true, default: 0 })
	reff!: number;

	@Column({ type: "varchar", length: 155, default: "__" })
	pincode!: string;

	@Column({ type: "varchar", length: 255, default: "0@@0" })
	/** @comment used@@total */
	diskspace!: string;

	@Column({ type: "varchar", length: 255, default: "0@@0" })
	/** @comment used@@total */
	bandwidth!: string;

	@Column({ type: "varchar", length: 100, default: "none" })
	joined!: string;

	@Column({ type: "varchar", length: 100, default: "none" })
	signin!: string;

	@Column({ type: "int", default: 0 })
	status!: number;

}