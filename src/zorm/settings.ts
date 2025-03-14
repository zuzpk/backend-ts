/**
* AutoGenerated by @zuzjs/orm.
* @ Sun Feb 23 2025 13:17:22
*/
import { Entity, PrimaryColumn, PrimaryGeneratedColumn, Column, BaseEntity } from "@zuzjs/orm";

@Entity({ name: "settings" })
export class Settings extends BaseEntity {

	@PrimaryColumn()
	okey!: string;

	@Column({ type: "varchar", length: 155, default: "__" })
	value!: string;

	@Column({ type: "varchar", length: 20, default: "0" })
	stamp!: string;

}