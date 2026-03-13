import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import * as db from "./db";

export const appRouter = router({
  system: systemRouter,
  account: router({
    deleteAllData: protectedProcedure
      .input(z.object({ confirmation: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (input.confirmation !== "APAGAR TODOS OS DADOS") {
          throw new Error("Confirmacao incorreta");
        }
        await db.deleteAllUserData(ctx.user.id);
        return { success: true, message: "Todos os dados foram apagados com sucesso" };
      }),
    deleteAccount: protectedProcedure
      .input(z.object({ confirmation: z.string() }))
      .mutation(async ({ ctx, input }) => {
        if (input.confirmation !== "EXCLUIR MINHA CONTA") {
          throw new Error("Confirmacao incorreta");
        }
        await db.deleteAllUserData(ctx.user.id);
        await db.deleteUser(ctx.user.id);
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
        return { success: true, message: "Conta deletada com sucesso" };
      }),
  }),
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // ============ Clients Router ============
  clients: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getClientsByUserId(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        cpfCnpj: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createClient({
          userId: ctx.user.id,
          ...input,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        cpfCnpj: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateClient(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteClient(input.id);
      }),
  }),

  // ============ Products Router ============
  products: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getProductsByUserId(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        code: z.string().optional(),
        description: z.string().optional(),
        sku: z.string().optional(),
        supplierId: z.number().optional(),
        measure: z.string().optional(),
        unit: z.string().optional(),
        weight: z.string().optional(),
        cost: z.string().min(1),
        markup: z.string().optional(),
        marginPercentage: z.string().optional(),
        price: z.string().min(1),
        quantity: z.number().default(0),
        category: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createProduct({
          userId: ctx.user.id,
          ...input,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        sku: z.string().optional(),
        price: z.string().optional(),
        cost: z.string().optional(),
        quantity: z.number().optional(),
        category: z.string().optional(),
        supplierId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateProduct(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteProduct(input.id);
      }),
  }),

  // ============ Suppliers Router ============
  suppliers: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getSuppliersByUserId(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        cnpj: z.string().optional(),
        paymentTerms: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createSupplier({
          userId: ctx.user.id,
          ...input,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        email: z.string().email().optional(),
        phone: z.string().optional(),
        address: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        zipCode: z.string().optional(),
        cnpj: z.string().optional(),
        paymentTerms: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateSupplier(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteSupplier(input.id);
      }),
  }),

  // ============ Sales Router ============
  sales: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getSalesByUserId(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        clientId: z.number(),
        productId: z.number().optional(),
        quantity: z.number().min(1),
        unitPrice: z.string().min(1),
        totalPrice: z.string().min(1),
        discount: z.string().optional(),
        paymentMethod: z.string().optional(),
        paymentStatus: z.enum(["pending", "paid", "cancelled"]).optional(),
        accountId: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { accountId, ...saleData } = input;
        const sale = await db.createSale({
          userId: ctx.user.id,
          ...saleData,
        });
        
        if (accountId) {
          const paymentMethodMap: Record<string, "pix" | "cash" | "debit" | "credit" | "transfer"> = {
            "pix": "pix",
            "cash": "cash",
            "debit": "debit",
            "credit": "credit",
            "transfer": "transfer",
          };
          const mappedPaymentMethod = paymentMethodMap[input.paymentMethod?.toLowerCase() || "transfer"] || "transfer";
          
          await db.createFinancialTransaction({
            userId: ctx.user.id,
            transactionType: "income",
            paymentMethod: mappedPaymentMethod,
            accountId: accountId,
            amount: input.totalPrice,
            description: "Venda de produto",
            category: "Vendas",
            status: "completed",
            transactionDate: new Date(),
          });
        }
        
        return sale;
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        clientId: z.number().optional(),
        productId: z.number().optional(),
        quantity: z.number().optional(),
        unitPrice: z.string().optional(),
        totalPrice: z.string().optional(),
        discount: z.string().optional(),
        paymentMethod: z.string().optional(),
        paymentStatus: z.enum(["pending", "paid", "cancelled"]).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateSale(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteSale(input.id);
      }),
  }),

  // ============ Financial Records Router ============
  financial: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getFinancialTransactionsByUserId(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        type: z.enum(["income", "expense"]),
        category: z.string().min(1),
        description: z.string().optional(),
        amount: z.string().min(1),
        paymentMethod: z.string().optional(),
        status: z.enum(["pending", "completed", "cancelled"]).optional(),
        dueDate: z.date().optional(),
        paidDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createFinancialRecord({
          userId: ctx.user.id,
          ...input,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        type: z.enum(["income", "expense"]).optional(),
        category: z.string().optional(),
        description: z.string().optional(),
        amount: z.string().optional(),
        paymentMethod: z.string().optional(),
        status: z.enum(["pending", "completed", "cancelled"]).optional(),
        dueDate: z.date().optional(),
        paidDate: z.date().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateFinancialRecord(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteFinancialRecord(input.id);
      }),
    bankAccounts: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return db.getBankAccountsByUserId(ctx.user.id);
      }),
      create: protectedProcedure
        .input(
          z.object({
            accountName: z.string().min(1),
            bankName: z.string().optional(),
            accountNumber: z.string().optional(),
            accountType: z.enum(["checking", "savings", "investment", "cash"]).optional(),
            balance: z.string().optional(),
            currency: z.string().optional(),
          })
        )
        .mutation(async ({ ctx, input }) => {
          // Validação: contas não-cash precisam de bankName e accountNumber
          if (input.accountType !== "cash") {
            if (!input.bankName || !input.accountNumber) {
              throw new Error("Bank name and account number required for non-cash accounts");
            }
          }
          
          return db.createBankAccount({
            userId: ctx.user.id,
            accountName: input.accountName,
            bankName: input.accountType === "cash" ? null : (input.bankName || ""),
            accountNumber: input.accountType === "cash" ? null : (input.accountNumber || ""),
            accountType: input.accountType,
            balance: input.balance,
            currency: input.currency,
          });
        }),
    }),
    creditCards: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return db.getCreditCardsByUserId(ctx.user.id);
      }),
      create: protectedProcedure
        .input(z.object({
          cardName: z.string().min(1),
          cardBrand: z.enum(["visa", "mastercard", "amex", "elo", "other"]),
          cardNumber: z.string().min(1),
          cardHolder: z.string().min(1),
          expiryMonth: z.number().optional(),
          expiryYear: z.number().optional(),
          cvv: z.string().optional(),
          creditLimit: z.string().optional(),
          dueDay: z.number().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          return db.createCreditCard({
            userId: ctx.user.id,
            ...input,
          });
        }),
    }),
    digitalWallets: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return db.getDigitalWalletsByUserId(ctx.user.id);
      }),
      create: protectedProcedure
        .input(z.object({
          walletName: z.string().min(1),
          walletType: z.enum(["pix", "paypal", "stripe", "other"]),
          balance: z.string().optional(),
          currency: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          return db.createDigitalWallet({
            userId: ctx.user.id,
            ...input,
          });
        }),
    }),
    transactions: router({
      list: protectedProcedure.query(async ({ ctx }) => {
        return db.getFinancialTransactionsByUserId(ctx.user.id);
      }),
      create: protectedProcedure
        .input(z.object({
          transactionType: z.enum(["income", "expense"]),
          paymentMethod: z.enum(["cash", "pix", "debit", "credit", "transfer"]),
          accountId: z.number().optional(),
          walletId: z.number().optional(),
          creditCardId: z.number().optional(),
          amount: z.string().min(1),
          description: z.string().optional(),
          category: z.string().optional(),
          clientId: z.number().optional(),
          supplierId: z.number().optional(),
          productId: z.number().optional(),
          installments: z.number().optional(),
          transactionDate: z.union([z.string(), z.date()]),
          dueDate: z.string().optional(),
          notes: z.string().optional(),
        }))
        .mutation(async ({ ctx, input }) => {
          const { transactionDate, dueDate, ...rest } = input;
          const txDate = typeof transactionDate === 'string' ? new Date(transactionDate) : transactionDate;
          return db.createFinancialTransaction({
            userId: ctx.user.id,
            transactionDate: txDate,
            dueDate: dueDate ? new Date(dueDate) : undefined,
            ...rest,
          });
        }),
    }),
    totalBalance: protectedProcedure.query(async ({ ctx }) => {
      return db.getTotalBalance(ctx.user.id);
    }),
    getCashFlowData: protectedProcedure.query(async ({ ctx }) => {
      const transactions = await db.getFinancialTransactionsByUserId(ctx.user.id);
      
      const monthlyData: Record<string, any> = {};
      const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      
      const today = new Date();
      for (let i = 5; i >= 0; i--) {
        const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const monthName = monthNames[date.getMonth()];
        monthlyData[monthKey] = { mes: monthName, entradas: 0, saidas: 0 };
      }
      
      transactions.forEach((tx: any) => {
        const txDate = new Date(tx.transactionDate);
        const monthKey = `${txDate.getFullYear()}-${String(txDate.getMonth() + 1).padStart(2, '0')}`;
        
        if (monthlyData[monthKey]) {
          const amount = parseFloat(tx.amount) || 0;
          if (tx.transactionType === 'income') {
            monthlyData[monthKey].entradas += amount;
          } else {
            monthlyData[monthKey].saidas += amount;
          }
        }
      });
      
      return Object.values(monthlyData).map((data: any) => ({
        ...data,
        tendencia: data.entradas - data.saidas,
      }));
    }),
    cashBox: router({
      getBalance: protectedProcedure.query(async ({ ctx }) => {
        return db.getCashBox(ctx.user.id);
      }),
      getHistory: protectedProcedure.query(async ({ ctx }) => {
        const transactions = await db.getFinancialTransactionsByUserId(ctx.user.id);
        return transactions.filter((tx: any) => tx.paymentMethod === 'cash');
      }),
    }),
  }),

  // ============ Tasks Router ============
  tasks: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getTasksByUserId(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        title: z.string().min(1),
        description: z.string().optional(),
        dueDate: z.date(),
        completed: z.boolean().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        assignedTo: z.number().optional(),
        clientId: z.number().optional(),
        actionType: z.enum(["reuniao", "visita", "trabalho"]).optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createTask({
          userId: ctx.user.id,
          ...input,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        dueDate: z.date().optional(),
        completed: z.boolean().optional(),
        priority: z.enum(["low", "medium", "high"]).optional(),
        assignedTo: z.number().optional(),
        clientId: z.number().optional(),
        actionType: z.enum(["reuniao", "visita", "trabalho"]).optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateTask(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteTask(input.id);
      }),
  }),

  // ============ Teams Router ============
  teams: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getTeamsByUserId(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        description: z.string().optional(),
        members: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createTeam({
          userId: ctx.user.id,
          ...input,
        });
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        members: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        return db.updateTeam(id, data);
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteTeam(input.id);
      }),
  }),

  // ============ Supplier Purchases Router ============
  supplierPurchases: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getSupplierPurchasesByUserId(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        supplierId: z.number(),
        description: z.string().min(1),
        amount: z.string().min(1),
        purchaseDate: z.date(),
        dueDate: z.date(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const purchase = await db.createSupplierPurchase({
          userId: ctx.user.id,
          supplierId: input.supplierId,
          description: input.description,
          amount: input.amount as any,
          purchaseDate: input.purchaseDate,
          dueDate: input.dueDate,
          paymentStatus: "pending",
          notes: input.notes,
        });
        
        try {
          const supplier = await db.getSupplierById(input.supplierId);
          if (supplier && purchase) {
            await db.createSupplierPaymentEvent(ctx.user.id, purchase, supplier);
          }
        } catch (error) {
          console.error("[SupplierPurchases] Failed to create calendar event:", error);
        }
        
        return purchase;
      }),
    update: protectedProcedure
      .input(z.object({
        id: z.number(),
        description: z.string().optional(),
        amount: z.string().optional(),
        purchaseDate: z.date().optional(),
        dueDate: z.date().optional(),
        paymentStatus: z.enum(["pending", "paid", "cancelled"]).optional(),
        paidDate: z.date().optional(),
        accountId: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const { id, accountId, ...data } = input;
        const purchase = await db.getSupplierPurchaseById(id);
        const result = await db.updateSupplierPurchase(id, data as any);
        
        if (data.dueDate && purchase && purchase.calendarEventId) {
          try {
            const supplier = await db.getSupplierById(purchase.supplierId);
            if (supplier) {
              await db.updateSupplierPaymentEvent(purchase.calendarEventId, 
                { ...purchase, dueDate: data.dueDate } as any, 
                supplier
              );
            }
          } catch (error) {
            console.error("[SupplierPurchases] Failed to update calendar event:", error);
          }
        }
        
        if (data.paymentStatus === "paid" && accountId) {
          await db.createFinancialTransaction({
            userId: ctx.user.id,
            transactionType: "expense",
            paymentMethod: "transfer",
            accountId: accountId,
            amount: input.amount || "0",
            description: "Pagamento a fornecedor",
            category: "Fornecedores",
            status: "completed",
            transactionDate: new Date(),
          });
        }
        
        return result;
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input, ctx }) => {
        const purchase = await db.getSupplierPurchaseById(input.id);
        
        if (purchase && purchase.calendarEventId) {
          try {
            await db.removeSupplierPaymentEvent(purchase.calendarEventId);
          } catch (error) {
            console.error("[SupplierPurchases] Failed to remove calendar event:", error);
          }
        }
        
        return db.deleteSupplierPurchase(input.id);
      }),
    pay: protectedProcedure
      .input(z.object({
        purchaseId: z.number(),
        amount: z.string().optional(),
        paymentDate: z.date().optional(),
        paymentMethod: z.enum(["cash", "pix", "debit", "credit", "transfer"]).optional(),
        accountId: z.number().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const purchase = await db.getSupplierPurchaseById(input.purchaseId);
        if (!purchase) {
          throw new Error("Compra não encontrada");
        }

        const paymentAmount = input.amount || purchase.amount.toString();
        const paymentDate = input.paymentDate || new Date();

        await db.updateSupplierPurchase(input.purchaseId, {
          paymentStatus: "paid",
          paidDate: paymentDate,
        });

        await db.createFinancialTransaction({
          userId: ctx.user.id,
          transactionType: "expense",
          paymentMethod: input.paymentMethod || "transfer",
          accountId: input.accountId,
          amount: paymentAmount,
          description: `Pagamento: ${purchase.description}`,
          category: "Fornecedores",
          supplierId: purchase.supplierId,
          status: "completed",
          transactionDate: paymentDate,
          notes: input.notes || `Pagamento de compra a prazo do fornecedor`,
        });
        
        if (purchase.calendarEventId) {
          try {
            await db.removeSupplierPaymentEvent(purchase.calendarEventId);
          } catch (error) {
            console.error("[SupplierPurchases] Failed to remove calendar event:", error);
          }
        }

        return { success: true, message: "Pagamento registrado com sucesso" };
      }),
    syncCalendarEvents: protectedProcedure
      .mutation(async ({ ctx }) => {
        try {
          const purchases = await db.getPendingSupplierPurchasesByUserId(ctx.user.id);
          let created = 0;
          
          for (const purchase of purchases) {
            if (purchase.calendarEventId) continue;
            
            const supplier = await db.getSupplierById(purchase.supplierId);
            if (supplier) {
              await db.createSupplierPaymentEvent(ctx.user.id, purchase, supplier);
              created++;
            }
          }
          
          return { success: true, message: `${created} eventos de pagamento sincronizados` };
        } catch (error) {
          console.error("[SupplierPurchases] Failed to sync calendar events:", error);
          throw error;
        }
      }),
  }),

  // ============ Loans Router ============
  loans: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getLoansByUserId(ctx.user.id);
    }),
    getInstallmentsForCalendar: protectedProcedure.query(async ({ ctx }) => {
      // Get all installments for calendar view
      return db.getInstallmentsForCalendar(ctx.user.id);
    }),
    create: protectedProcedure.input(z.object({
      clientId: z.number(),
      type: z.enum(["lent", "borrowed"]),
      initialAmount: z.string(),
      accountId: z.number().optional(),
      interestRate: z.string().default("0"),
      isInstallment: z.boolean().default(false),
      numberOfInstallments: z.number().optional(),
      frequency: z.string().default("monthly"),
    })).mutation(async ({ ctx, input }) => {
      // JUROS SIMPLES (FIXO): O sistema utiliza APENAS juros simples
      // Cálculo: valor_total = valor_inicial + (valor_inicial * percentual_juros)
      // Os juros são calculados UMA ÚNICA VEZ no momento da criação
      // Não são recalculados após pagamentos parciais
      
      const initialAmount = parseFloat(input.initialAmount);
      let totalWithInterest = initialAmount;
      let remainingBalance = initialAmount;
      
      if (input.interestRate) {
        const rate = parseFloat(input.interestRate);
        // Cálculo de juros simples: valor_total = valor_inicial * (1 + taxa/100)
        totalWithInterest = initialAmount * (1 + rate / 100);
        remainingBalance = totalWithInterest;
        console.log(`[Loans] Juros Simples: ${initialAmount} * (1 + ${rate}%) = ${totalWithInterest}`);
      }
      
      const result = await db.createLoan({
        userId: ctx.user.id,
        clientId: input.clientId,
        accountId: input.accountId,
        type: input.type,
        initialAmount: initialAmount.toString(),
        interestRate: input.interestRate,
        isInstallment: input.isInstallment,
        numberOfInstallments: input.numberOfInstallments,
        frequency: input.frequency,
        totalWithInterest: totalWithInterest.toString(),
        remainingBalance: remainingBalance.toString(),
        status: "active",
      });
      
      console.log("[Loans] Create result:", result);
      console.log("[Loans] Result keys:", Object.keys(result));
      
      if (input.accountId) {
        const isIncome = input.type === "borrowed";
        // NOTE: updateBankAccountBalance is called inside createFinancialTransaction
        // Do NOT call it here to avoid double-counting
        
        await db.createFinancialTransaction({
          userId: ctx.user.id,
          transactionType: isIncome ? "income" : "expense",
          paymentMethod: "transfer",
          accountId: input.accountId,
          amount: input.initialAmount,
          description: isIncome ? "Emprestimo recebido" : "Emprestimo concedido",
          category: "Emprestimos",
          status: "completed",
          transactionDate: new Date(),
        });
      }
      
      // Create installments if needed
      console.log("[Loans] isInstallment:", input.isInstallment, "numberOfInstallments:", input.numberOfInstallments);
      
      if (input.isInstallment && input.numberOfInstallments && input.numberOfInstallments > 0) {
        const installmentAmount = totalWithInterest / input.numberOfInstallments;
        const installments: any[] = [];
        const startDate = new Date();
        
        // Get the loan ID from the result - Drizzle returns OkPacket with insertId
        let loanId = 0;
        console.log("[Loans] Result type:", typeof result, "Result:", JSON.stringify(result));
        
        // Try different ways to extract the ID
        // Drizzle with MySQL2 returns an array with ResultSetHeader as first element
        if (Array.isArray(result) && result.length > 0 && (result[0] as any).insertId) {
          loanId = Number((result[0] as any).insertId);
          console.log("[Loans] Got loanId from result[0].insertId:", loanId);
        } else if ((result as any).insertId) {
          loanId = Number((result as any).insertId);
          console.log("[Loans] Got loanId from insertId:", loanId);
        } else if ((result as any)[0]?.id) {
          loanId = (result as any)[0].id;
          console.log("[Loans] Got loanId from result[0].id:", loanId);
        } else if (Array.isArray(result) && result.length > 0) {
          loanId = (result[0] as any).id;
          console.log("[Loans] Got loanId from Array:", loanId);
        }
        
        // If still no ID, query the database for the latest loan
        if (!loanId || loanId === 0) {
          console.log("[Loans] Attempting to get loanId from database query...");
          const latestLoans = await db.getLoansByUserId(ctx.user.id);
          if (latestLoans && latestLoans.length > 0) {
            loanId = latestLoans[0].id;
            console.log("[Loans] Got loanId from database query:", loanId);
          }
        }
        
        console.log("[Loans] Final loanId for installments:", loanId);
        
        if (!loanId || loanId === 0) {
          console.error("[Loans] ERROR: Could not extract loanId from result!");
          throw new Error("Failed to get loan ID for creating installments");
        }
        
        for (let i = 1; i <= input.numberOfInstallments; i++) {
          const dueDate = new Date(startDate);
          dueDate.setMonth(dueDate.getMonth() + i);
          const validDueDate = new Date(dueDate.getTime());
          
          installments.push({
            loanId: loanId,
            installmentNumber: i,
            dueDate: validDueDate,
            amount: installmentAmount.toFixed(2),
            status: "pending",
          });
        }
        
        console.log("[Loans] Installments to create:", JSON.stringify(installments));
        
        if (installments.length > 0) {
          try {
            const createResult = await db.createLoanInstallments(installments);
            console.log("[Loans] Installments created successfully:", createResult);
          } catch (error) {
            console.error("[Loans] Error creating installments:", error);
            throw error;
          }
        }
      } else {
        console.log("[Loans] Skipping installments: isInstallment=", input.isInstallment, "numberOfInstallments=", input.numberOfInstallments);
      }
      
      return result;
    }),
    update: protectedProcedure.input(z.object({
      id: z.number(),
      status: z.enum(["active", "completed", "overdue"]).optional(),
      totalPaid: z.string().optional(),
      remainingBalance: z.string().optional(),
    })).mutation(async ({ ctx, input }) => {
      return db.updateLoan(input.id, {
        status: input.status,
        totalPaid: input.totalPaid,
        remainingBalance: input.remainingBalance,
      });
    }),
    delete: protectedProcedure.input(z.object({ id: z.number() })).mutation(async ({ ctx, input }) => {
      return db.deleteLoan(input.id);
    }),
    getInstallments: protectedProcedure.input(z.object({ loanId: z.number() })).query(async ({ input }) => {
      return db.getLoanInstallments(input.loanId);
    }),
    recordPayment: protectedProcedure.input(z.object({
      loanId: z.number(),
      amount: z.string(),
      paymentType: z.enum(["full", "partial"]),
      accountId: z.number().optional(),
      notes: z.string().optional(),
      installmentIds: z.array(z.number()).optional(),
      installmentId: z.number().optional(),
    })).mutation(async ({ ctx, input }) => {
      // JUROS SIMPLES: Pagamentos sao abatidos diretamente do saldo restante
      // O valor total com juros NAO eh alterado apos a criacao
      // Apenas o saldo restante (remainingBalance) eh reduzido
      
      const paidAmount = parseFloat(input.amount);
      
      // Create the payment record
      const payment = await db.createLoanPayment({
        loanId: input.loanId,
        amount: input.amount,
        paymentType: input.paymentType,
        notes: input.notes,
      });
      
      // Handle partial payment with interest recalculation
      if (input.paymentType === "partial" && input.installmentId) {
        const loan = await db.getLoanById(input.loanId);
        if (loan) {
          const interestRate = parseFloat(loan.interestRate?.toString() || "0");
          await db.handlePartialLoanPayment({
            loanId: input.loanId,
            installmentId: input.installmentId,
            paidAmount,
            interestRate,
          });
        }
      } else if (input.installmentIds && input.installmentIds.length > 0) {
        // Handle full payment of installments
        for (const installmentId of input.installmentIds) {
          const installment = await db.getLoanInstallmentById(installmentId);
          if (installment) {
            await db.updateLoanInstallment(installmentId, {
              status: "paid",
              paidAmount: installment.amount,
              paidAt: new Date(),
            });
          }
        }
      }
      
      // Create financial transaction if account is provided
      if (input.accountId) {
        // NOTE: updateBankAccountBalance is called inside createFinancialTransaction
        // Do NOT call it here to avoid double-counting
        
        await db.createFinancialTransaction({
          userId: ctx.user.id,
          transactionType: "income",
          paymentMethod: "transfer",
          accountId: input.accountId,
          amount: input.amount,
          description: `Pagamento de emprestimo - ${input.paymentType === "full" ? "Pagamento completo" : "Pagamento parcial"}`,
          category: "Emprestimos",
          status: "completed",
          transactionDate: new Date(),
        });
      }
      
      // Update loan remaining balance
      const loan = await db.getLoanById(input.loanId);
      if (loan) {
        const remainingBalance = String(loan.remainingBalance || "0");
        const totalPaid = String(loan.totalPaid || "0");
        const newRemainingBalance = (parseFloat(remainingBalance) - parseFloat(input.amount)).toString();
        const newTotalPaid = ((parseFloat(totalPaid) + parseFloat(input.amount))).toString();
        
        await db.updateLoan(input.loanId, {
          remainingBalance: newRemainingBalance,
          totalPaid: newTotalPaid,
          status: (parseFloat(newRemainingBalance) <= 0 ? "completed" : "active") as any,
        });
      }
      
      return payment;
    }),
    getPayments: protectedProcedure.input(z.object({ loanId: z.number() })).query(async ({ input }) => {
      return db.getLoanPayments(input.loanId);
    }),
  }),

  // ============ Calendar Router ============
  calendar: router({
    events: protectedProcedure.query(async ({ ctx }) => {
      return db.getCalendarEvents(ctx.user.id);
    }),
  }),

  // ============ Dashboard Router ============
  dashboard: router({
    metrics: protectedProcedure.query(async ({ ctx }) => {
      return db.getDashboardMetrics(ctx.user.id);
    }),
    tasksStatistics: protectedProcedure
      .input(z.object({ teamId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getTasksStatistics(ctx.user.id, input.teamId);
      }),
    tasksCompletedByWeek: protectedProcedure
      .input(z.object({ teamId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getTasksCompletedByWeek(ctx.user.id, input.teamId);
      }),
    memberProductivity: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return db.getMemberProductivity(input.teamId);
      }),
    financialSummary: protectedProcedure.query(async ({ ctx }) => {
      return db.getFinancialSummary(ctx.user.id);
    }),
  }),

  // ============ Team Tasks Router ============
  teamTasks: router({
    getMembers: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamMembers(input.teamId);
      }),
    addMember: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        userId: z.number(),
        role: z.enum(["admin", "member"]),
      }))
      .mutation(async ({ input }) => {
        return db.addTeamMember(input.teamId, input.userId, input.role);
      }),
    removeMember: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        userId: z.number(),
      }))
      .mutation(async ({ input }) => {
        return db.removeTeamMember(input.teamId, input.userId);
      }),
    getTasks: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamTasks(input.teamId);
      }),
    createTask: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        title: z.string().min(1),
        description: z.string().optional(),
        assignedTo: z.number(),
        startDate: z.date().optional(),
        dueDate: z.date(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createTeamTask({
          teamId: input.teamId,
          title: input.title,
          description: input.description,
          assignedTo: input.assignedTo,
          startDate: input.startDate,
          dueDate: input.dueDate,
          createdBy: ctx.user.id,
        });
      }),
    updateTaskStatus: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        status: z.enum(["pending", "in_progress", "completed"]),
      }))
      .mutation(async ({ input }) => {
        return db.updateTeamTaskStatus(input.taskId, input.status);
      }),
    deleteTask: protectedProcedure
      .input(z.object({ taskId: z.number() }))
      .mutation(async ({ input }) => {
        return db.deleteTeamTask(input.taskId);
      }),
    getMessages: protectedProcedure
      .input(z.object({ teamId: z.number() }))
      .query(async ({ input }) => {
        return db.getTeamMessages(input.teamId);
      }),
    sendMessage: protectedProcedure
      .input(z.object({
        teamId: z.number(),
        message: z.string().min(1),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.createTeamMessage({
          teamId: input.teamId,
          userId: ctx.user.id,
          message: input.message,
        });
      }),
  }),

  // ============ Notifications Router ============
  notifications: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getNotifications(ctx.user.id);
    }),
    getUnreadCount: protectedProcedure.query(async ({ ctx }) => {
      return db.getUnreadNotificationCount(ctx.user.id);
    }),
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.markNotificationAsRead(input.id);
      }),
  }),

  // ============ Reports Router ============
  reports: router({
    getReportData: protectedProcedure
      .input(z.object({
        teamId: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .query(async ({ ctx, input }) => {
        return db.getReportData(ctx.user.id, input.teamId, input.startDate, input.endDate);
      }),
    getOverdueTasks: protectedProcedure
      .input(z.object({ teamId: z.number().optional() }))
      .query(async ({ ctx, input }) => {
        return db.getOverdueTasks(ctx.user.id, input.teamId);
      }),
    getFinancialAnomalies: protectedProcedure.query(async ({ ctx }) => {
      return db.getFinancialAnomalies(ctx.user.id);
    }),
  }),

  // ============ PDV (Point of Sale) Router ============
  pdv: router({
    // Search products for quick lookup
    searchProducts: protectedProcedure
      .input(z.object({
        query: z.string().min(1),
      }))
      .query(async ({ ctx, input }) => {
        return db.searchProductsForPdv(ctx.user.id, input.query);
      }),

    // Get product favorites/shortcuts
    getFavorites: protectedProcedure.query(async ({ ctx }) => {
      return db.getProductFavorites(ctx.user.id);
    }),

    // Add product to favorites
    addFavorite: protectedProcedure
      .input(z.object({
        productId: z.number(),
        position: z.number().optional().default(0),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.addProductFavorite(ctx.user.id, input.productId, input.position);
      }),

    // Remove product from favorites
    removeFavorite: protectedProcedure
      .input(z.object({
        productId: z.number(),
      }))
      .mutation(async ({ ctx, input }) => {
        return db.removeProductFavorite(ctx.user.id, input.productId);
      }),

    // Create a complete sales order
    createOrder: protectedProcedure
      .input(z.object({
        clientId: z.number().optional(),
        sellerId: z.number().optional(),
        items: z.array(z.object({
          productId: z.number(),
          quantity: z.number().min(1),
          unitPrice: z.string(),
          discount: z.string().optional().default("0"),
          discountType: z.enum(["percentage", "fixed"]).optional().default("fixed"),
          subtotal: z.string(),
        })),
        subtotal: z.string(),
        discount: z.string().optional().default("0"),
        discountType: z.enum(["percentage", "fixed"]).optional().default("fixed"),
        total: z.string(),
        paymentMethod: z.enum(["cash", "card", "pix", "check", "mixed"]),
        amountPaid: z.string(),
        change: z.string().optional().default("0"),
        notes: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        const orderData = {
          userId: ctx.user.id,
          clientId: input.clientId || null,
          sellerId: input.sellerId || null,
          subtotal: input.subtotal as any,
          discount: input.discount as any,
          discountType: input.discountType as any,
          total: input.total as any,
          paymentMethod: input.paymentMethod as any,
          amountPaid: input.amountPaid as any,
          change: input.change as any,
          paymentStatus: "paid" as any,
          notes: input.notes || null,
        };

        const items = input.items.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          discount: item.discount,
          discountType: item.discountType,
          subtotal: item.subtotal,
        })) as any;

        return db.createSalesOrder(orderData, items);
      }),

    // Get sales order with items
    getOrder: protectedProcedure
      .input(z.object({
        orderId: z.number(),
      }))
      .query(async ({ input }) => {
        return db.getSalesOrderWithItems(input.orderId);
      }),

    // Get sales orders for user
    listOrders: protectedProcedure
      .input(z.object({
        limit: z.number().optional().default(50),
      }))
      .query(async ({ ctx, input }) => {
        return db.getSalesOrdersByUserId(ctx.user.id, input.limit);
      }),

    // Update order status
    updateOrderStatus: protectedProcedure
      .input(z.object({
        orderId: z.number(),
        status: z.enum(["pending", "paid", "cancelled"]),
      }))
      .mutation(async ({ input }) => {
        return db.updateSalesOrderStatus(input.orderId, input.status);
      }),
  }),

  // ============ Expense Categories Router ============
  expenseCategories: router({
    list: protectedProcedure.query(async ({ ctx }) => {
      return db.getExpenseCategoriesByUserId(ctx.user.id);
    }),
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        icon: z.string().optional(),
        color: z.string().optional(),
      }))
      .mutation(async ({ ctx, input }) => {
        // Check for duplicate (case-insensitive)
        const existing = await db.getExpenseCategoriesByUserId(ctx.user.id);
        const isDuplicate = existing.some(
          (cat) => cat.nameLower === input.name.toLowerCase()
        );

        if (isDuplicate) {
          throw new Error(`Categoria "${input.name}" já existe`);
        }

        return db.createExpenseCategory({
          userId: ctx.user.id,
          name: input.name,
          icon: input.icon,
          color: input.color,
        });
      }),
    delete: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.deleteExpenseCategory(input.id, ctx.user.id);
      }),
    seedDefaults: protectedProcedure
      .mutation(async ({ ctx }) => {
        await db.seedDefaultExpenseCategories(ctx.user.id);
        return { success: true };
      }),
  }),
});

export type AppRouter = typeof appRouter;
