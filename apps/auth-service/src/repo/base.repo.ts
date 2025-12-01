//Generic, future-safe base repository 
import { Model } from "mongoose";

export class BaseRepository<T> {
  constructor(private model: Model<T>) {}

  // CREATE
  async create(data: Partial<T>): Promise<T> {
    return this.model.create(data as any) as any;
  }

  // FIND BY ID
  async findById(id: string): Promise<T | null> {
    return this.model.findById(id).exec();
  }

  // FIND ONE
  async findOne(filter: Record<string, any>): Promise<T | null> {
    return this.model.findOne(filter).exec();
  }

  // FIND ALL
  async findAll(filter: Record<string, any> = {}): Promise<T[]> {
    return this.model.find(filter).exec();
  }

  // UPDATE BY ID
  async updateById(id: string, data: Partial<T>): Promise<T | null> {
    return this.model.findByIdAndUpdate(id, data as any, { new: true }).exec();
  }

  // DELETE BY ID
  async deleteById(id: string): Promise<T | null> {
    return this.model.findByIdAndDelete(id).exec();
  }

  // SOFT DELETE
  async softDelete(id: string): Promise<T | null> {
    return this.model
      .findByIdAndUpdate(id, { deleted: true } as any, { new: true })
      .exec();
  }
}
